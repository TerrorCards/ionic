import React, {useState, useEffect} from 'react';
import { IonGrid, IonRow, IonCol, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonModal, IonButton, IonImg, IonThumbnail,
  IonButtons, IonContent, IonHeader, IonMenuButton, IonFooter, IonPage, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon, IonFabList,
  IonChip, IonLabel, IonItem, IonSlides, IonSlide
} from '@ionic/react';
import {close, add, settings, share, person, arrowForwardCircle, arrowBackCircle, arrowUpCircle, logoVimeo, logoFacebook, logoInstagram, logoTwitter } from 'ionicons/icons';
import './GalleryContainer.css';
import ProfileContainer from '../components/ProfileContainer';
import {callServer} from './ajaxcalls';

interface ContainerProps {
  galleryProps: any;
}

const GalleryContainer: React.FC<ContainerProps> = ({ galleryProps }) => {

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [cardDetails, setCardDetails] = useState(null as any);

  let dataList: Array<any> = [];
  let chunkedList: Array<any> = [];
  let length = 0;
  let list:any = null;
  let infiniteScroll:any = null; 

  //Functions to do chunking of data
  let chunkVersions = (array: Array<any>) => {
    const localList = [...array];
    let chunkList:Array<any> = [];
    if (localList.length > 0) {
      chunkList = chunk(localList, galleryProps.layoutCount);
    }
    return chunkList;
  }
  let chunk = (array: Array<any>, size:number) => {
    const temparray = [];
    const chunk = size;
    let i, j;
    for (i = 0, j = array.length; i < j; i += chunk) {
      temparray.push(array.slice(i, i + chunk));
    }
    return temparray;
  }
  //End chunking functions

  function showCardetails(card:any) {
    setShowDetails(true);
    setCardDetails( 
    <IonGrid>
      <IonRow><IonCol><div style={{height:50}}></div></IonCol></IonRow>      
      <IonRow>
      <IonCol><img src={card.Image} width="100%" /></IonCol> 
      </IonRow>
      <IonRow>
        <IonCol>Card Count</IonCol> 
        <IonCol>Sold Out?</IonCol> 
      </IonRow> 
      <IonRow>
        <IonCol>Type:</IonCol> 
        <IonCol>Set:</IonCol> 
      </IonRow>                
    </IonGrid>     
    )
  }

  function appendItems(number:number) {
    const sizeOfItem = (100/galleryProps.layoutCount);
    //const list = document.getElementById('list') as HTMLIonListElement;
    const originalLength = length;
    for (var i = 0; i < number; i++) {
      let filtered = chunkedList[i+originalLength];
      if(filtered && filtered.length > 0) {
          const row = document.createElement("IonRow") as HTMLIonRowElement;
          filtered.map((f:any) => {
            const col1 = document.createElement("IonCol") as HTMLIonColElement;
            col1.onclick = () => {showCardetails(f);}
            const img = document.createElement("img");
            let imgSrc = f.Image;
            if(galleryProps.layoutCount > 2) {
              imgSrc = imgSrc.replace("full", "thumbs");
            }
            img.setAttribute('src', imgSrc);
            img.setAttribute('width', sizeOfItem +"%");
            col1.appendChild(img);
            row.appendChild(col1);
          });
          list!.appendChild(row);
      }
    };
    length = length + number;
  }

  function wait(time:number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  }


  function pullCards() {
    callServer("cards",{year:galleryProps.year, category:galleryProps.set, view:galleryProps.view},"TerrorCards")?.then((resp)=>{ console.log(resp); return resp.json(); })
    .then((json)=>{ 
      if(json.length > 0) {
        dataList = json;
        chunkedList = chunkVersions(dataList);
        //updateMessages({msg: msgList, controlList: json});
        initializeScroll();
        appendItems(galleryProps.layoutCount*3);
      }
    })
    .catch((err:any) => {
      console.log(err);
    });
  }

  function initializeScroll() {
    length = 0;
    list = document.getElementById('list') as HTMLIonListElement;
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
    infiniteScroll = document.getElementById('infinite-scroll') as HTMLIonInfiniteScrollElement;
    if(infiniteScroll !== null) {
      infiniteScroll!.removeEventListener("ionInfinite", infiniteScrollEvent);
      infiniteScroll!.addEventListener('ionInfinite', infiniteScrollEvent);
    }    
  }

  async function infiniteScrollEvent () {
    console.log(length + " : " + chunkedList.length);
    if (length < chunkedList.length) {
      console.log('Loading data...');
      await wait(500);
      infiniteScroll!.complete();
      appendItems(galleryProps.layoutCount);
      console.log('Done');
    } else {
      console.log('No More Data');
      infiniteScroll!.disabled = true;
    }
  }

  useEffect(() => {
      pullCards();
      console.log(galleryProps);
  },[galleryProps.year, galleryProps.layoutCount, galleryProps.set, galleryProps.view]);

  return (
      <IonContent style={{height:'92%'}}>

      <IonGrid id="list"></IonGrid>

      <IonInfiniteScroll threshold="100px" id="infinite-scroll">
      <IonInfiniteScrollContent
          loading-spinner="bubbles">
      </IonInfiniteScrollContent>
      </IonInfiniteScroll>

      <IonModal isOpen={showDetails} cssClass='my-custom-class'>
        {cardDetails}
        <IonButton onClick={() => setShowDetails(false)}>Close Details</IonButton>
      </IonModal>

      </IonContent>
  );


/*
        <IonInfiniteScroll threshold="100px" id="infinite-scroll">
        <IonInfiniteScrollContent
            loading-spinner="bubbles">
        </IonInfiniteScrollContent>
        </IonInfiniteScroll>
        */

};

export default GalleryContainer;
