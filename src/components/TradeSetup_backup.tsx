import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSegment, IonSegmentButton, IonLabel,
  IonList, IonItem, IonCardHeader, IonCard, IonCardSubtitle, IonCardTitle, IonCardContent, IonModal,
  IonButton, IonSlides, IonSlide, IonImg, IonGrid, IonRow, IonCol, IonAvatar, IonTextarea, IonAlert,
  IonPopover, IonIcon, IonBadge,
  withIonLifeCycle
} from '@ionic/react';
import './TradeSetup.css';
import GalleryMenu from './GalleryMenu';
import {callServer} from './ajaxcalls';
import { ellipse, square, triangle, informationCircle, closeCircleOutline, settingsOutline, filter } from 'ionicons/icons';


interface props {
  otherUser: string;
  user: any;
  closePanel: any;
}

interface state {
  showAlert: boolean,
  showInfoPopover: boolean,
  showOverLimitAlert: boolean,
  showFilterMenu: boolean,
  alertType: string,
  event: any,

  layoutState: any,

  step:string,
  tradeCardsList: Array<any>;
  yourCards: Array<any>;
  yourChunkList: Array<any>;
  otherCards: Array<any>;
  otherChunkList: Array<any>;
  selectionCardList: Array<any>;
}

class TradeSetup extends React.Component<props, state> {

  constructor(props:any) {
    super(props);

    this.state = {
      showAlert: false,
      showInfoPopover: false,
      showOverLimitAlert: false,
      showFilterMenu: false,
      alertType: '',
      event: undefined,

      layoutState: {
        layoutCount: 3,
        year: (new Date()).getFullYear(), 
        set:'All', 
        view:"owned",
        viewOptions: "owned,needs"
      },

      step: "you",
      tradeCardsList: [],
      yourCards: [],
      yourChunkList: [],
      otherCards: [],
      otherChunkList: [],
      selectionCardList: []     
    };
  }

  ionViewWillEnter() {
    console.log("Ion view will enter");
  }

  ionViewWillLeave() {
  }

  ionViewDidEnter() {
    this.pullCards(this.props.user.ID, this.props.otherUser).then((result) => {
      this.pullCards(this.props.otherUser, this.props.user.ID).then((response) => {
        this.generateImageSelectionList();
      });  
    });
    console.log("Ion view did enter");
  }

  componentDidUpdate() {
    if(this.state.yourCards.length <= 0) {
      this.pullCards(this.props.user.ID, this.props.otherUser).then((result) => {
        this.pullCards(this.props.otherUser, this.props.user.ID).then((response) => {
          this.generateImageSelectionList();
        });  
      });      
    }
  }

  ionViewDidLeave() {
  }

  changeTradeTab = (tab:string) => {
    this.setState({step:tab}, () => {
      if(tab === "you" || tab == "other") {
        this.generateImageSelectionList();
      }
    });
  }

  showAlertPrompt =(action:string) => {
    this.setState({showAlert:true, alertType:action})
  }

  closeTradeWindow =() => {
  }

  pullCards =(user:string, otherParty:string) => {
    return new Promise ((resolve:any, reject:any) => {
      callServer("tradeSetup",{year:this.state.layoutState.year, 
        category:this.state.layoutState.set, 
        receiver: otherParty,
        needs:(this.state.layoutState.view === 'owned')?'N':'Y'},user)?.then((resp)=>{ console.log(resp); return resp.json(); })
      .then((json)=>{ 
        if(json.length > 0) {
          //dataList = json;
          console.log(json);
          if(user === this.props.user.ID) {
            const chunk = this.chunkCards(json);
            const chunkWithMatchNumbers = this.matchCountNumbers(chunk, user);
            this.setState({yourCards:json, yourChunkList:chunkWithMatchNumbers});
          } else {
            const chunk = this.chunkCards(json);
            const chunkWithMatchNumbers = this.matchCountNumbers(chunk, user);
            this.setState({otherCards:json, otherChunkList:chunkWithMatchNumbers});
          }
          resolve(true);
        }
      })
      .catch((err:any) => {
        console.log(err);
        resolve(err);
      });
    });
  }

  //Functions to do chunking of data
  chunkCards = (array: Array<any>) => {
    const localList = [...array];
    let chunkList:Array<any> = [];
    if (localList.length > 0) {
      chunkList = this.chunk(localList, this.state.layoutState.layoutCount);
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


  render() {

    const pic = 'http://placekitten.com/g/200/300';

    let content: any = '';
    if(this.state.step === 'you' || this.state.step === 'other') {
      content = this.showCardSelection(this.state.step);
    } else {
      content = this.showTradeSummary();
    }

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
              <IonItem>
              <IonLabel>Trade Setup</IonLabel>
              <IonLabel>
                  <div style={{textAlign:'end'}}>
                  <IonButton fill='clear' onClick={(e:any)=>{this.resetParameter()}}>
                    <IonIcon  slot="end" icon={closeCircleOutline}  color="dark" />
                  </IonButton>
                  </div>
              </IonLabel>
              </IonItem>

          </IonToolbar>
        </IonHeader>
        <IonContent>

          <IonSegment value={this.state.step} onIonChange={(e:any) => {this.changeTradeTab(e.detail.value)}}  color="dark">
            <IonSegmentButton value="you">
              <IonLabel>Give</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="other">
              <IonLabel>Receive</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="summary">
              <IonLabel>Summary</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {content}

          <IonAlert
            isOpen={this.state.showAlert}
            onDidDismiss={() => this.closeTradeWindow()}
            cssClass='my-custom-class'
            header={'Confirm ' + this.state.alertType}
            message={'Are you sure you want to ' + this.state.alertType}
            buttons={[
              {
                text: 'No',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah:any) => {
                  console.log('Confirm Cancel: blah');
                  this.setState({showAlert:false, alertType:''});
                }
              },
              {
                text: 'Yes',
                handler: () => {
                  console.log('Confirm Okay');
                  this.setState({showAlert:false, alertType:''});
                }
              }
            ]}
          />

          <IonAlert
            isOpen={this.state.showOverLimitAlert}
            onDidDismiss={() => this.setState({showOverLimitAlert:false})}
            cssClass='my-custom-class'
            header={'Alert'}
            message={'Sorry, only up to 5 cards can be traded in 1 trade.'}
            buttons={[
              {
                text: 'Dismiss',
                role: 'cancel',
                cssClass: 'secondary',
                handler: (blah:any) => {
                  this.setState({showOverLimitAlert:false});
                }
              }
            ]}
          />

          <IonPopover
            cssClass='my-custom-class'
            isOpen={this.state.showInfoPopover}
            onDidDismiss={() => this.setState({ showInfoPopover: false, event: undefined})}
          >
            <IonLabel position="stacked">Once a trade is submitted. The other party will have 24 hours to accept, otherwise the trade will expire.<br/></IonLabel>
            <IonLabel position="stacked">If any of the cards in this trade are exchanged in a different trade, this trade will automatically get cancelled.</IonLabel>
          </IonPopover>


          <IonPopover
            cssClass='popper-custom-menu-size'
            isOpen={this.state.showFilterMenu}
            onDidDismiss={() => this.setState({ showFilterMenu: false, event: undefined })}
          >
            <GalleryMenu layoutAction={this.processCardListFilters}  layoutProps={this.state.layoutState} user={this.props.user} />
          </IonPopover>

        </IonContent>
      </IonPage>
    );
  }

  processCardListFilters =(type:any, value:any) => {
    let localObj = {...this.state.layoutState};
    for(let key in localObj) {
      if(key === type) {
        localObj[key] = value;
      }
    }
    this.setState({layoutState: localObj}, () => {
      this.pullCards(this.props.user.ID, this.props.otherUser).then((result) => {
        this.pullCards(this.props.otherUser, this.props.user.ID).then((response) => {
          //todo (decrease what is already in the trade panel in new fetched cards)


          this.generateImageSelectionList();
        });  
      });
    })
  }

  showTradeSummary =() => {
    let yourItems:Array<any> = [];
    let othersItems: Array<any> = [];
    let disabled:boolean = true;
    yourItems = this.generateSummaryItems('you');
    othersItems = this.generateSummaryItems('other');

    if(yourItems.length > 0 && othersItems.length > 0) {
      disabled = false;
    }

    return(
      <IonGrid>
      <IonRow>
          <IonCol class="ion-text-center">You are giving up</IonCol>
      </IonRow>
      <IonRow>
          {(yourItems.length <= 0)?'Invalid trade':yourItems}
      </IonRow>
      <IonRow>
          <IonCol class="ion-text-center"><hr /></IonCol>
      </IonRow>
      <IonRow>
          <IonCol class="ion-text-center">You are receiving</IonCol>
      </IonRow>
      <IonRow>
        {(othersItems.length <= 0)?'Invalid trade':othersItems}
      </IonRow>
      <IonRow>
          <IonCol>
            <IonItem>
              <IonLabel position="stacked">Add a message to this trade (optional)</IonLabel>
              <IonTextarea placeholder="type here" rows={5}></IonTextarea>
            </IonItem>
          </IonCol>
      </IonRow>
      <IonRow>
          <IonCol class="ion-text-center" size="4"><IonButton disabled={disabled} color="success" expand="block" onClick={() => {this.showAlertPrompt('submit')}}>Submit</IonButton></IonCol>
          <IonCol class="ion-text-center" size="4">
          <IonButton color="medium" onClick={
              (e: any) => {
                e.persist();
                this.setState({ showInfoPopover: true, event: e })
              }}>
            <IonIcon slot="icon-only" icon={informationCircle} />
           </IonButton>
          </IonCol>
          <IonCol class="ion-text-center" size="4"><IonButton color="danger" expand="block" onClick={() => {this.showAlertPrompt('cancel')}}>Cancel</IonButton></IonCol>
      </IonRow>
    </IonGrid>
    );
  }

  generateImageSelectionList =() => {
    let personList = [];
    if(this.state.step === 'you') {
      personList = this.state.yourChunkList;
    } else {
      personList = this.state.otherChunkList;
    }
    const list:Array<any> = [];
    personList.map((ch:any,i:number) => {
      const item:Array<any> = [];
      ch.map((c:any, z:number) => {
        let imgSrc = c.Image;
        if(this.state.layoutState.layoutCount > 2) {
          imgSrc = imgSrc.replace("full", "thumbs");
        }
        item.push(
          <IonCol key={c.ID}>
            <IonImg src={imgSrc} class={(c.UserID === null)?'need-card-alpha':''} onClick={
              () => {this.showCardetails(c)}
              }>
            </IonImg>
            <IonButton strong={true} class="trade-button-add" size="small" color={(c.Count <= 0)?"danger":"success"} disabled={(c.Count <= 0)?true:false} onClick={() => {
              this.addToTradeList(c, this.state.step);
            }}>+</IonButton>
            {(c.Count !== null && c.Count > 1) && <IonBadge class="quantity-badge">{c.Count}</IonBadge>}
          </IonCol>
        )
        if(i === (personList.length -1)){
          if(ch.length  < this.state.layoutState.layoutCount) {
            const remainder = this.state.layoutState.layoutCount - ch.length;
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
    this.setState({selectionCardList:list});
  }

  addToTradeList =(card:any, person:string) => { 
      //search trade list to see if already exist and increment
      let local = [...this.state.tradeCardsList];
      if(local.length > 0) {
        let found = false;
        local.map((lc:any) => {
          if(lc.ID === card.ID) {
            found = true;
            lc.Count = lc.Count + 1;
          }
        });
        if(!found) {
          if(this.state.tradeCardsList.length < 5) { 
            let localCard = {...card};
            localCard.Count = 1;
            local.push(localCard); 
          } else {
            this.setState({showOverLimitAlert:true});
          }                 
        }
      } else {
        if(this.state.tradeCardsList.length < 5) { 
          let localCard = {...card};
          localCard.Count = 1;
          local.push(localCard);
        } else {
          this.setState({showOverLimitAlert:true});
        }         
      }
      //in selection list, decrease count and if zero, add button should be disabled on next render
      let playerList = null;
      if(this.state.step === 'you') {
        playerList = [...this.state.yourChunkList];
      } else {
        playerList = [...this.state.otherChunkList];
      }
      if(playerList !== null) {
        playerList.map((pl:any) => {
          pl.map((p:any) => {
            if(card.ID === p.ID) {
              p.Count = p.Count - 1;
            }
          })
        })
      }

      if(this.state.step === 'you') {
        this.setState({tradeCardsList:local, yourChunkList:playerList},() => {
          this.generateImageSelectionList();
        });
      } else {
        this.setState({tradeCardsList:local, otherChunkList:playerList},() => {
          this.generateImageSelectionList();
        });
      }


      //need another function to check and adjust selection list if criteria for selection list changes.
  }

  removeFromTrade =(card:any, person:string) => {
    let local = [...this.state.tradeCardsList];
    let found = -1;
    if(local.length > 0) {
      //if it's over 1, just decrease, otherwise, remove it
      local.map((lc:any, i:number) => {
        if(lc.ID === card.ID) {
          if(lc.Count > 1) {
            lc.Count = lc.Count - 1;
          } else {
            found = i;
          }
        }
      });
      if(found !== -1) {
        local.splice(found,1);
      }
      //add back to the player list
      let playerList = null;
      if(this.state.step === 'you') {
        playerList = [...this.state.yourChunkList];
      } else {
        playerList = [...this.state.otherChunkList];
      }
      if(playerList !== null) {
        playerList.map((pl:any) => {
          pl.map((p:any) => {
            if(card.ID === p.ID) {
              p.Count = p.Count + 1;
            }
          })
        })
      }

      if(this.state.step === 'you') {
        this.setState({tradeCardsList:local, yourChunkList:playerList},() => {
          this.generateImageSelectionList();
        });
      } else {
        this.setState({tradeCardsList:local, otherChunkList:playerList},() => {
          this.generateImageSelectionList();
        });
      }

    }
  }


  showCardSelection =(person:string) => {
    let message = "";
    let itemsList = [];
    if(person === 'you') {
      message = "You are giving up";
    } else {
      message = "You are receiving";
    }
    itemsList = this.generateTradeItemCol(this.state.step);
    return(
      <IonGrid>
      <IonRow>
          <IonCol class="ion-text-center">{message}</IonCol>
      </IonRow>
      <IonRow>
        {itemsList}
      </IonRow>
      <IonRow>
        <IonCol size="10" class="ion-text-left ion-align-items-center">
          <IonItem>{'Select cards below'}</IonItem>
        </IonCol>
        <IonCol size="2" class="ion-text-center">
          <IonButton fill='clear' onClick={(e:any)=>{this.setState({ showFilterMenu: true, event: e })}}>
              <IonIcon  slot="end" icon={settingsOutline}  color="dark" />
            </IonButton>         
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <div style={{height:"10%", overflowY:'auto'}}>
            <IonGrid>
            {this.state.selectionCardList}
            </IonGrid>
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
    );
  }

  generateTradeItemCol =(person:string) => {
    const pic = 'http://placekitten.com/g/200/300';
    let filtered:Array<any> = [];
    let itemsList = [];    
      filtered = this.state.tradeCardsList.filter((cl:any) => {
        if(person === 'you') {
          return(cl.UserID === this.props.user.ID);
        } else {
          return(cl.UserID !== this.props.user.ID);
        }
      });
      if(filtered.length > 0) {
        for(let i=0; i<5; i++) {
          if(filtered[i]) {
            itemsList.push(
              <IonCol class="ion-text-center" key={i}>
                <img src={filtered[i].Image} />
                <IonButton className="trade-button-remove" size="small" color="danger" onClick={() => {
                  this.removeFromTrade(filtered[i], this.state.step);
                }}>x</IonButton>                
                {(filtered[i].Count !== null && filtered[i].Count > 1) && <IonBadge class="quantity-badge">{filtered[i].Count}</IonBadge>}
              </IonCol>
            );
          } else {
            itemsList.push(<IonCol class="ion-text-center" key={i}><img src="assets/img/waitSmall.png" /></IonCol>);
          }
        }
      } else {
        for(let i=0; i<5; i++) {
          itemsList.push(<IonCol class="ion-text-center" key={i}><img src="assets/img/waitSmall.png" /></IonCol>);
        }
      }

    return itemsList;   
  }

  generateSummaryItems =(person:string) => {
    const pic = 'http://placekitten.com/g/200/300';
    let filtered:Array<any> = [];
    let itemsList = [];    
    if(this.state.tradeCardsList.length > 0) {
      filtered = this.state.tradeCardsList.filter((cl:any) => {
        if(person === 'you') {
          return(cl.UserID === this.props.user.ID);
        } else {
          return(cl.UserID !== this.props.user.ID);
        }
      });
      if(filtered.length > 0) {
        for(let i=0; i<5; i++) {
          if(filtered[i]) {
            itemsList.push(
              <IonCol class="ion-text-center" key={i}>
                <img src={filtered[i].Image} style={{width:75}} />
                <IonButton className="trade-button-remove" size="small" color="danger" onClick={() => {
                  this.removeFromTrade(filtered[i], this.state.step);
                }}>x</IonButton>                
                {(filtered[i].Count !== null && filtered[i].Count > 1) && <IonBadge class="quantity-badge">{filtered[i].Count}</IonBadge>}
              </IonCol>
            );
          }
          else {
          itemsList.push(<IonCol class="ion-text-center" key={i}></IonCol>);
          }          
        }
      }
    } 
    return itemsList;  
  }


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
    //this.setState({cardDetails:details, showDetails:true})
  }

  matchCountNumbers = (list:any, player:string) => {
    let localPlayerList = [...list];
    if(localPlayerList.length > 0) {

      let local = [...this.state.tradeCardsList];
      if(local.length > 0) {
        let filtered = local.filter((lc:any) => {
          return(lc.UserID === player)
        })
        if(filtered.length > 0) {
          localPlayerList.map((pl:any) => {
            pl.map((p:any) => {
              filtered.map((f:any) => {
                if(f.ID === p.ID) {
                  p.Count = p.Count - f.Count;
                }
              })
            })
          })
        }

      }
    }
    return localPlayerList;    
  }

  resetParameter = () => {
    this.setState({
      step: "you",
      tradeCardsList: [],
      yourCards: [],
      yourChunkList: [],
      otherCards: [],
      otherChunkList: [],
      selectionCardList: []       
    },() => {
      this.props.closePanel();
    })
  }


}

export default withIonLifeCycle(TradeSetup);
