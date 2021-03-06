/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saga.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import {
  GET_FARM_INFO,
  GET_FIELD_CROPS,
  GET_FIELD_CROPS_BY_DATE,
  GET_FIELDS,
  GET_USER_INFO,
  // UPDATE_AGREEMENT,
  UPDATE_FARM,
  UPDATE_USER_INFO,
} from './constants';
import {
  fetchFarmInfo,
  getFieldCrops,
  getFields,
  // setFarmInState,
  setFieldCropsInState,
  setFieldsInState,
  setUserInState,
} from './actions';
import { updateConsentOfFarm } from './ChooseFarm/actions.js';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import apiConfig, { userFarmUrl } from '../apiConfig';
import { toastr } from 'react-redux-toastr';
import history from '../history';
import Auth from '../Auth/Auth.js';
import { loginSelector, loginSuccess } from './loginSlice';
import { userFarmSelector, putUserSuccess } from './userFarmSlice';
import { createAction } from '@reduxjs/toolkit';

const axios = require('axios');

export function getHeader(user_id, farm_id){
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id,
      farm_id,
    },
  }
}
export const updateUser = createAction('updateUserSaga');
export function* updateUserSaga({ payload: user }) {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id );
  const { userUrl } = apiConfig;
  let data = user;
  if (data.wage === null) {
    delete data.wage;
  }
  if (data.phone_number === null) {
    delete data.phone_number;
  }
  try {
    const result = yield call(axios.put, userUrl + '/' + user_id, data, header);
    yield put(putUserSuccess(user));
    toastr.success('Successfully updated user info!')
  } catch (e) {
    toastr.error('Failed to update user info')
  }
}

export function* getFarmInfo() {
  try {
    let userFarm = yield select(userFarmSelector);

    //TODO potential bug
    if (!userFarm.farm_id) {
      history.push('/add_farm');
      return;
    }
    localStorage.setItem('role_id', userFarm.role_id);
    yield put(getFields());
    yield put(getFieldCrops());
  } catch (e) {
    console.log(e);
    toastr.error('failed to fetch farm from database');
  }
}

export function* updateFarm(payload) {
  const { farmUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id );

  // OC: We should never update address information of a farm.
  let { address, grid_points, ...data } = payload.farm;
  if (data.farm_phone_number === null) {
    delete data.farm_phone_number;
  }
  try {
    const result = yield call(axios.put, farmUrl + '/' + farm_id, data, header);
    if (result && result.data && result.data.length > 0) {
      // yield put(setFarmInState(result.data[0]));
      // TODO (refactoring): Handle the response to be sent properly in backend so we
      // don't need to do this extra API call to keep redux consistent
      yield put(updateConsentOfFarm(farm_id, result.data[0]))
      yield put(fetchFarmInfo());
      toastr.success('Successfully updated farm info!');
    }
  } catch (e) {
    toastr.error('Failed to update farm info')
  }
}

export function* getFieldsSaga() {
  const { fieldURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id );

  try {
    const result = yield call(axios.get, fieldURL + '/farm/' + farm_id, header);
    if (result) {
      yield put(setFieldsInState(result.data));
    }
  } catch (e) {
    console.log('failed to fetch fields from database')
  }
}

export function* getFieldCropsSaga() {
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id );

  try {
    const result = yield call(axios.get, fieldCropURL + '/farm/' + farm_id, header);
    if (result) {
      yield put(setFieldCropsInState(result.data));
    }
  } catch (e) {
    console.log('failed to fetch field crops from db');
  }
}

export function* getFieldCropsByDateSaga() {
  let currentDate = formatDate(new Date());
  const { fieldCropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id );

  try {
    const result = yield call(axios.get, fieldCropURL + '/farm/date/' + farm_id + '/' + currentDate, header);
    if (result) {
      yield put(setFieldCropsInState(result.data));
    }
  } catch (e) {
    console.log('failed to fetch field crops by date')
  }
}

const formatDate = (currDate) => {
  const d = currDate;
  let
    year = d.getFullYear(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// export function* updateAgreementSaga(payload) {
//   const userFarm = yield select(userFarmSelector);
//   const {user_id, farm_id, step_three} = userFarm;
//   const { callback } = payload;
//   const patchStepUrl = (farm_id, user_id) => `${userFarmUrl}/onboarding/farm/${farm_id}/user/${user_id}`;
//
//   const { userFarmUrl } = apiConfig;
//   const header = {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
//       user_id,
//       farm_id,
//     },
//   };
//
//   let data = {
//     has_consent: payload.consent_bool.consent,
//     consent_version: payload.consent_version,
//   };
//
//   try {
//     //TODO replace changed async calls with axios.all
//     const result = yield call(axios.patch, userFarmUrl + '/consent/farm/' + farm_id + '/user/' + user_id, data, header);
//     if (result) {
//       if (payload.consent_bool.consent) {
//         // TODO potential bug
//         // yield put(updateConsentOfFarm(farm_id, data));
//         // yield put(setFarmInState(data));
//         // const farms = yield select((state) => state.userFarmReducer.farms);
//         // const selectedFarm = farms.find((f) => f.farm_id === farm_id);
//         let step = {};
//         if (!step_three) {
//           step = {
//             step_three: true,
//             step_three_end: new Date(),
//           };
//           yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
//         }
//         yield put(setFarmInState({ ...userFarm, ...step, ...data }));
//         callback && callback();
//       } else {
//         //did not give consent - log user out
//         const auth = new Auth();
//         auth.logout();
//         history.push('/callback');
//       }
//     }
//   } catch (e) {
//     toastr.error('Failed to update user agreement');
//   }
// }

export default function* getFarmIdSaga() {
  yield takeLatest(updateUser.type, updateUserSaga);
  yield takeLatest(GET_FARM_INFO, getFarmInfo);
  yield takeLatest(UPDATE_FARM, updateFarm);
  yield takeLatest(GET_FIELDS, getFieldsSaga);
  yield takeLatest(GET_FIELD_CROPS, getFieldCropsSaga);
  yield takeLatest(GET_FIELD_CROPS_BY_DATE, getFieldCropsByDateSaga);
  // yield takeLatest(UPDATE_AGREEMENT, updateAgreementSaga);
}
