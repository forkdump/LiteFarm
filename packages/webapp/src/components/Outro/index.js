import styles from './styles.scss';
import OutroImg from '../../assets/images/outro/outro.svg';
import Footer from '../Footer';
import Button from '../Form/Button';
import React from 'react';

export default function PureOutroSplash({ onContinue, onGoBack }) {
  return (
    <>
      <div className={styles.home}>
        <div className={styles.lander}>
          <div className={styles.greetContainer}>
            <img src={OutroImg}/>
            <div className={styles.description}>
              <h3>{`And finally, let us show you a couple of important things!`}</h3>
            </div>
          </div>

        </div>

      </div>
      <Footer style={{ position: 'sticky', bottom: '0' }}
              children={<><Button fullLength color="secondary" children='Go back' onClick={onGoBack}/>

                <Button fullLength children='Finish' onClick={onContinue}/>
              </>}
      >
      </Footer>
    </>
  )
}
