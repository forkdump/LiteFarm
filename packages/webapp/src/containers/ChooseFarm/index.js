/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
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

import React, { useEffect, useState } from 'react';
import history from '../../history';
import { selectFarmSuccess, deselectFarmSuccess, loginSelector } from '../loginSlice';
import {switchFarmSuccess} from "../switchFarmSlice"
import { userFarmsByUserSelector } from '../userFarmSlice';
import { useDispatch, useSelector } from 'react-redux';
import PureChooseFarmScreen from '../../components/ChooseFarm';
import { getUserFarms } from './saga';

function ChooseFarm() {

  const dispatch = useDispatch();
  const farms = useSelector(userFarmsByUserSelector);
  const [selectedFarmId, setFarmId] = useState();
  const { farm_id: currentFarmId } = useSelector(loginSelector);
  const [filter, setFilter] = useState();

  useEffect(()=>{
    dispatch(getUserFarms());
  },[]);

  useEffect(()=>{
    if(farms?.length === 1){
      setFarmId(farms[0].farm_id);
    }
  },[farms]);

  const onGoBack = () => {
    history.goBack();
  }

  const onProceed = () => {
    dispatch(selectFarmSuccess({ farm_id: selectedFarmId }));
    if (currentFarmId) {
      dispatch(switchFarmSuccess())
    }
    history.push('/');
  }

  const onSelectFarm = (farm_id) => {
    setFarmId(farm_id);
  }

  const onCreateFarm = () => {
    dispatch(deselectFarmSuccess());
    history.push('/add_farm');
  };

  const onFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  }



  return <PureChooseFarmScreen farms={getFormattedFarms({filter, farms, currentFarmId, selectedFarmId})} onGoBack={onGoBack}
                               onProceed={onProceed} onSelectFarm={onSelectFarm} onCreateFarm={onCreateFarm}
                               isOnBoarding={!currentFarmId} onFilterChange={onFilterChange} isSearchable={farms.length>5}
                               disabled={!selectedFarmId} title={currentFarmId?'Switch to another farm': 'Choose your farm'}
  />

}

const getFormattedFarms = ({filter, farms, currentFarmId, selectedFarmId}) => {
  const filteredFarms = filter ? farms.filter(farm =>
    (farm.owner_name && farm.owner_name.toLowerCase().includes(filter)) || farm.farm_name.toLowerCase().includes(filter) || farm.address.toLowerCase().includes(filter) || farm.farm_id === currentFarmId
  ) : farms;

  const sortedFarm = filteredFarms.sort((farm1, farm2) => {
    if(farm1.farm_id !== currentFarmId && farm2.farm_id !== currentFarmId){
      return farm1.farm_name.localeCompare(farm2.farm_name);
    }else{
      return farm1.farm_id === currentFarmId ? -1 : 1;
    }
  })

  return sortedFarm.map(farm => {
    const newFarm = {};
    newFarm.farm_id = farm.farm_id;
    newFarm.address = getAddress(farm, newFarm);
    newFarm.farmName = farm.farm_name;
    newFarm.ownerName = farm.owner_name;
    newFarm.color = getColor(farm, selectedFarmId, currentFarmId);
    return newFarm;
  })
}

const getAddress = (farm, newFarm) => {
  const { address } = farm;
  const isCoordinate = /-?\d*\.\d*, -?\d*\.\d*/.test(address);
  if (isCoordinate) {
    return [farm.grid_points.lat.toFixed(5), farm.grid_points.lng.toFixed(5)];
  } else {
    newFarm.fullAddress = address.replace(/(.*), .*/, '$1');
    const addressArray = address.split(', ');
    return addressArray.splice(0, addressArray.length - 1);
  }
}

const getColor = (farm, selectedFarmId, currentFarmId) => {
  if (farm.farm_id === currentFarmId) {
    return 'disabled';
  } else if (farm.farm_id === selectedFarmId) {
    return 'active';
  } else return 'secondary';
}

export default ChooseFarm;
