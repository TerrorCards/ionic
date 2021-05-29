import React from 'react';
import {withIonLifeCycle, IonGrid, IonRow, IonCol, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonModal, IonButton, IonImg, IonThumbnail,
  IonButtons, IonContent, IonHeader, IonMenuButton, IonFooter, IonPage, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon, IonFabList,
  IonChip, IonLabel, IonItem, IonSlides, IonSlide, IonBadge
} from '@ionic/react';
import {close, add, settings, share, person, arrowForwardCircle, arrowBackCircle, arrowUpCircle, logoVimeo, logoFacebook, logoInstagram, logoTwitter } from 'ionicons/icons';
import './GalleryContainer.css';
import {callServer} from './ajaxcalls';

interface props {
  galleryProps: any;
}

interface state {
  showModal: boolean,
  showDetails: boolean,
  cardDetails:any,
  dataList: Array<any>,
  chunkedList: Array<any>,
  length:number,
  list:any,
  infiniteScroll:any,
  imgList: Array<any>
}

class GalleryContainer extends React.Component<props, state> {

  constructor(props:any) {
    super(props);

    this.state = {
      showModal: false,
      showDetails: false,
      cardDetails: null ,
      dataList: [],
      chunkedList: [],
      length: 0,
      list: null,
      infiniteScroll: null ,
      imgList: []        
    }
  }

  componentDidMount() {
    this.pullCards();
    console.log('component did mount event fired')    
  }

  componentDidUpdate(prevProps:any) {
    if(prevProps.galleryProps.year !== this.props.galleryProps.year ||
      prevProps.galleryProps.view !== this.props.galleryProps.view || 
      prevProps.galleryProps.set !== this.props.galleryProps.set
      ) {
      this.pullCards();
      console.log('Props updated'); 
    }  
    if(prevProps.galleryProps.layoutCount !== this.props.galleryProps.layoutCount) {
      this.resetChunks();
    }
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter event fired')
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave event fired')
  }

  ionViewDidEnter() {
    this.pullCards();
    console.log('ionViewDidEnter event fired')
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave event fired')
  }

  //Functions to do chunking of data
  chunkVersions = (array: Array<any>) => {
    const localList = [...array];
    let chunkList:Array<any> = [];
    if (localList.length > 0) {
      chunkList = this.chunk(localList, this.props.galleryProps.layoutCount);
    }
    return chunkList;
  }

  chunk = (array: Array<any>, size:number) => {
    const temparray = [];
    const chunk = size;
    let i, j;
    for (i = 0, j = array.length; i < j; i += chunk) {
      temparray.push(array.slice(i, i + chunk));
    }
    return temparray;
  }
  //End chunking functions

  showCardetails =(card:any) => {
    const details =  
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
    </IonGrid>;
    this.setState({cardDetails:details, showDetails:true})
  }

  pullCards =() => {
    callServer("cards",{year:this.props.galleryProps.year, 
      category:this.props.galleryProps.set, 
      view:this.props.galleryProps.view},"TerrorCards")?.then((resp)=>{ console.log(resp); return resp.json(); })
    .then((json)=>{ 
      if(json.length > 0) {
        //dataList = json;
        console.log(json);
        const chunkedList = this.chunkVersions(json);
        this.setState({chunkedList:chunkedList, dataList:json}, ()=> {
          this.imgList();
          //this.initializeScroll();
          //this.appendItems(this.props.galleryProps.layoutCount*3);
        });
        //updateMessages({msg: msgList, controlList: json});
      } else {
        this.setState({imgList:[]});
      }
    })
    .catch((err:any) => {
      console.log(err);
    });
  }

  imgList =() => {
    const list:Array<any> = [];
    this.state.chunkedList.map((ch:any,i:number) => {
      const item:Array<any> = [];
      ch.map((c:any, z:number) => {
        let imgSrc = c.Image;
        if(this.props.galleryProps.layoutCount > 2) {
          imgSrc = imgSrc.replace("full", "thumbs");
        }
        item.push(
          <IonCol key={c.ID}>
            <IonImg src={imgSrc} class={(c.UserID === null)?'need-card-alpha':''} onClick={
              () => {this.showCardetails(c)}
              }>
            </IonImg>
            {(c.Count !== null && c.Count > 1) && <IonBadge class="quantity-badge">{c.Count}</IonBadge>}
          </IonCol>
        )
        if(i === (this.state.chunkedList.length -1)){
          if(ch.length  < this.props.galleryProps.layoutCount) {
            const remainder = this.props.galleryProps.layoutCount - ch.length;
            for(let a=0; a < remainder; a++) {
              item.push(
                <IonCol key={a+"_"+z}></IonCol>
              )             
            }
          }
        }
      });
      list.push(
        <IonRow key={i}>{item}</IonRow>
      );
    });
    this.setState({imgList:list});
  }

  resetChunks = () => {
    const newChunks = this.chunkVersions(this.state.dataList);
    this.setState({chunkedList: newChunks}, () => {
      this.imgList();
    });
  }

  render() {

    return (
      <IonContent style={{height:'92%'}}>

      <IonGrid id="list">{this.state.imgList}</IonGrid>


      <IonModal isOpen={this.state.showDetails}>
        {this.state.cardDetails}
        <IonButton onClick={() => this.setState({showDetails:false, cardDetails:null})}>Close Details</IonButton>
      </IonModal>

      </IonContent>
    );
  }


/*
        <IonInfiniteScroll threshold="100px" id="infinite-scroll">
        <IonInfiniteScrollContent
            loading-spinner="bubbles">
        </IonInfiniteScrollContent>
        </IonInfiniteScroll>
        */

};

export default withIonLifeCycle(GalleryContainer);
