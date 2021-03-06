import styles from "./styles.scss";
import OutroImg from "../../assets/images/farm-switch-outro/outro.svg";
import Button from "../Form/Button";
import React from "react";
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';

export default function FarmSwitchPureOutroSplash({onFinish}) {
  const userFarm = useSelector(userFarmSelector);
  const newFarm = userFarm.farm_name;
  const descriptionTop = "The barn door is secure.";
  const descriptionBottom = "Heading to: ";

  return (
    <div className={styles.outroContainer}>
      <div className={styles.title}>
        {`Switching Farms`}
      </div>
      <div className={styles.imgContainer}>
        <img src={OutroImg}/>
      </div>

      <div className={styles.descriptionTop}>
          {descriptionTop}
      </div>
      <div className={styles.descriptionBottom}>
        {descriptionBottom}
      </div>
      <div className={styles.bold}>
        {newFarm}
      </div>
      <Button className={styles.bottomContainer} children="Let's Go!" onClick={onFinish}></Button>

    </div>
  )
}