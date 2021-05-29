import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonContent,
  IonItem,
  IonPopover,
  IonModal
} from '@ionic/react';
import React, {useState, useEffect} from 'react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, cart, home, flask, trophy, square, skull, repeat, images, person, settings} from 'ionicons/icons';
import HomeContainer from './components/HomeContainer';
import GalleryContainer from './components/GalleryContainer';
import ProfileContainer from './components/ProfileContainer';
import StoreContainer from './components/StoreContainer';

import TradeSetup from './components/TradeSetup';
import GalleryMenu from './components/GalleryMenu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

const App: React.FC = () => {
 
  const [popoverState, setShowPopover] = useState({ showPopover: false, event: undefined  });
  const [galleryState, setGalleryLayout] = useState({ layoutCount: 3, isInitialize: false, year: (new Date()).getFullYear(), set:'All', view:"owned", viewOptions:"all" }); 
  const [user, updateUserInfo] = useState({ID:'TerrorCards', Credit:0});
  const [showTradeSetupModel, setShowTrade] = useState(false);
  const [tradeUser, setTradeuser] = useState('');

  const fnUpdateUserInfo =(info:any) => {
    updateUserInfo({ID:info.Name, Credit:info.Credit})
  }

  //Gallery functions
  const fnGalleryLayout =(param:string, item:number) => {
    const localSettings: any = {...galleryState};
    localSettings[param] = item;
    setGalleryLayout({layoutCount: localSettings.layoutCount, isInitialize:true ,year:localSettings.year, set:localSettings.set, view:localSettings.view, viewOptions:localSettings.viewOptions}); 

    //setGalleryLayout({ layoutCount: item, isInitialize:true });
    //setTimeout(() => {
    //  setGalleryLayout({ layoutCount: item, isInitialize:true });
    //}, 500);
  }

  const showPoperAction =(e:any) => {
    if(popoverState.showPopover) {
      setShowPopover({ showPopover: false, event: undefined });
    } else {
      setShowPopover({ showPopover: true, event: e });
    }
  }

  const showTradeModal = (e:any) => {
    if(showTradeSetupModel) {
      setShowTrade(false);
      setTradeuser('');
    } else {
      setShowTrade(true);
      setTradeuser(e);
    }
  }

  let menuContent:any = '';

  /*
  setTimeout(() => {
    if(galleryState.year === -1) {
      const localSettings: any = {...galleryState};
      setGalleryLayout({layoutCount: localSettings.layoutCount, isInitialize:true ,year:(new Date()).getFullYear(), set:localSettings.set, view:localSettings.view}); 
    }    
  },1000);
  */

  //this.nav.parent.select(tabIndex);

  return(
  <IonApp>   
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>           
          <Route exact path="/home">
            <ProfileContainer menuAction={showPoperAction} user={user} profileCallback={fnUpdateUserInfo} />          
            <HomeContainer name="home" user={user} tradeCallback={showTradeModal} />
          </Route>
          <Route exact path="/gallery">
            <ProfileContainer menuAction={showPoperAction} user={user} profileCallback={fnUpdateUserInfo}  />  
            <GalleryContainer galleryProps={galleryState} key={galleryState.layoutCount} />
            {menuContent = <GalleryMenu layoutAction={fnGalleryLayout}  layoutProps={galleryState} user={user} />}
          </Route>
          <Route path="/store">
            <ProfileContainer menuAction={showPoperAction} user={user} profileCallback={fnUpdateUserInfo} /> 
            <StoreContainer storeProps={''} user={user}/>
          </Route>
          <Route exact path="/">
            <ProfileContainer menuAction={showPoperAction} user={user} profileCallback={fnUpdateUserInfo} />          
            <HomeContainer name="home" user={user} tradeCallback={showTradeModal} />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="gallery" href="/gallery">
            <IonIcon icon={images} />
            <IonLabel>Gallery</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/tab2"></IonTabButton>          
          <IonTabButton tab="store" href="/store">
            <IonIcon icon={cart} />
            <IonLabel>Store</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab4" href="/tab4">
            <IonIcon icon={repeat} />
            <IonLabel>Trades</IonLabel>
          </IonTabButton>          
        </IonTabBar>
      </IonTabs>

      <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton color="dark">
            <IonIcon icon={skull} />
          </IonFabButton>
          <IonFabList side="top">
            <IonFabButton color="dark" onClick={()=>{}}><IonIcon icon={person} /></IonFabButton>
          </IonFabList>
          <IonFabList side="start">
            <IonFabButton color="dark"><IonIcon icon={flask} /></IonFabButton>
          </IonFabList>
          <IonFabList side="end">
            <IonFabButton color="dark"><IonIcon icon={trophy} /></IonFabButton>
          </IonFabList>
        </IonFab>

        <IonPopover
        cssClass='popper-custom-menu-size'
        isOpen={popoverState.showPopover}
        onDidDismiss={() => setShowPopover({ showPopover: false, event: undefined })}
      >
        {menuContent}
      </IonPopover>

      {showTradeSetupModel && <IonModal isOpen={showTradeSetupModel} cssClass='my-custom-class'>          
          <TradeSetup otherUser={tradeUser} user={user} closePanel={showTradeModal} />          
      </IonModal>}

    </IonReactRouter>
  </IonApp>
)};

export default App;
