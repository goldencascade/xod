import { merge } from 'ramda';
import { combineReducers } from 'redux';

import projectReducer from '../project/reducer';
import undoableProject from './undoableProject';
import projectBrowserReducer from '../projectBrowser/reducer';
import editorReducer from '../editor/reducer';
import errorsReducer from '../messages/reducer';
import processesReducer from '../processes/reducer';
import popupsReducer from '../popups/reducer';

import keepIntegrityAfterNavigatingHistory from './keepIntegrityAfterNavigatingHistory';

const combineRootReducers = (extraReducers) => {
  const reducers = merge(
    {
      project: projectReducer,
      projectHistory: (s = {}) => s,
      projectBrowser: projectBrowserReducer,
      popups: popupsReducer,
      editor: editorReducer,
      errors: errorsReducer,
      processes: processesReducer,
    },
    extraReducers
  );

  return undoableProject(
    combineReducers(reducers),
    keepIntegrityAfterNavigatingHistory
  );
};

export const createReducer = combineRootReducers;

export default createReducer;
