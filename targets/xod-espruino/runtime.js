
function nullFunc() {};

/**
  * @typedef {{
  *   lazy: boolean,
  *   nodeId: number,
  *   key: string
  * }} OutLink
  */
/**
  * @param {function} setup
  *   node’s setup function
  * @param {function} evaluate
  *   node’s evaluation function (aka implementation)
  * @param {boolean} pure
  *   whether `impl` should receive `fire` function as argument
  * @param {Object.<string, function>} inputTypes
  *   input type coercing functions
  * @param {Object.<string, Array.<OutLink>>} outLinks
  *   map from output name to outgoing link description
  * @param {Object.<number, Node>} nodes
  *   map from ID to `Node` instances
  */
function Node(args) {
  this._id = args.id;
  this._setup = args.setup || nullFunc;
  this._evaluate = args.evaluate || nullFunc;
  this._pure = (args.pure === undefined) ? true : args.pure;
  this._inputTypes = args.inputTypes || {};
  this._outLinks = args.outLinks || {};
  this._nodes = args.nodes;

  this._cachedInputs = {};
  this._pendingOutputs = {};
  this._dirty = false;
}

/**
  * Fires new signals at arbitrary point of time.
  *
  * The method is used by impure nodes to trigger external signals.
  * It is used by pure nodes as well but only in their setup to send
  * initial values.
  */
Node.prototype.fire = function(outputs) {
  for (var key in outputs) {
    if (outputs.hasOwnProperty(key)) {
      this._pendingOutputs[key] = outputs[key];
    }
  }

  this.emit('fire');
}

/**
  * Transaction start handler.
  *
  * It would be called from outside once before each transaction.
  */
Node.prototype.onTransactionStart = function() {
  this._sendOutputs(this._pendingOutputs);
  this._pendingOutputs = {};
}

/**
  * Returns whether any inputs were changed and node requires evaluation
  * in current transaction.
  */
Node.prototype.isDirty = function() {
  return this._dirty;
}

/**
  * Initializes the `Node`, sends initial signals.
  *
  * Called once the graph is ready at the very beginning of program execution.
  */
Node.prototype.setup = function() {
  this._setup(this.fire.bind(this));
}

/**
  * Evaluates the `Node` taking input signals and producting output signals.
  */
Node.prototype.evaluate = function() {
  if (!this._dirty) {
    return;
  }

  var fireCallback = this._pure ? null : this.fire.bind(this);
  var inputs = this._cachedInputs.clone();
  var result = this._evaluate(inputs, fireCallback) || {};
  this._sendOutputs(result);
  this._dirty = false;
}

Node.prototype._receiveInput = function(name, value, lazy) {
  this._cachedInputs[name] = this._inputTypes[name](value);
  this._dirty = this._dirty || !lazy;
}

Node.prototype._sendOutputs = function(signals) {
  var self = this;
  Object.keys(signals).forEach(function(outputName) {
    var outLinks = self._outLinks[outputName];
    if (!outLinks) {
      return;
    }

    var val = signals[outputName];
    outLinks.forEach(function(link) {
      self._nodes[link.nodeId]._receiveInput(link.key, val, !!link.lazy);
    });
  });
}

/**
  * @param {Object.<number, Node>} args.nodes
  *   map from ID to Node instances
  * @param {Array.<number, number>} args.topology 
  *   sorted node index list that defines an order
  *   of the graph traversal
  */
function Project(args) {
  this._nodes = args.nodes;
  this._topology = args.topology;
  this._pendingTransaction = false;
  this._inTransaction = false;
}

/**
  * Setups all nodes all starts graph execution.
  */
Project.prototype.launch = function() {
  var fire = this.onNodeFire.bind(this);
  this.forEachNode(function(node) { node.on('fire', fire); });

  this._inSetup = true;

  try {
    this.forEachNode(function(node) { node.setup(); });
  } finally {
    this._inSetup = false;
  }

  this.flushTransaction();
}

/**
  * Starts a new transaction if required and possible.
  *
  * If ran it lead to cascade evaluation of all dirty nodes.
  */
Project.prototype.flushTransaction = function() {
  if (!this._pendingTransaction || this._inTransaction || this._inSetup) {
    return;
  }

  this._pendingTransaction = false;
  this._inTransaction = true;

  try {
    this.forEachNode(function(node) { node.onTransactionStart(); });

    let node;
    while ( (node = this.getFirstDirtyNode()) ) {
      node.evaluate();
    }

  } finally {
    this._inTransaction = false;
  }

  setTimeout(this.flushTransaction.bind(this), 0);
}

/**
  * Returns the first `Node` that should be evaluated according
  * to topological sort indexes. Returns `undefined` if all nodes
  * are up to date in current transaction.
  */
Project.prototype.getFirstDirtyNode = function() {
  var len = this._topology.length;
  for (let i = 0; i < len; ++i) {
    var nodeId = this._topology[i];
    var node = this._nodes[nodeId];
    if (node.isDirty()) {
      return node;
    }
  }
}

/**
  * Node fire handler.
  *
  * Gets called when any node uses `Node.fire` to issue an external signal
  * or an initial signal.
  */
Project.prototype.onNodeFire = function() {
  this._pendingTransaction = true;
  this.flushTransaction();
}

/**
  * Executes `callback` with `node` argument for every node in the graph.
  */
Project.prototype.forEachNode = function(callback) {
  var self = this;
  Object.keys(this._nodes).forEach(function(id) { callback(self._nodes[id]); });
}

module.exports.Node = Node;
module.exports.Project = Project;
