import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from "@angular/core";
import { HomewatchApi } from "homewatch-js";
import { Events, NavController, NavParams, PopoverController, ToastController } from "ionic-angular";

import { ThingsInfoHelper } from "../../../helpers/things_info";
import { HomewatchApiService } from "../../../services/homewatch_api";
import { ShowHomePage } from "../../homes/show/show";
import { ShowThingPopoverPage } from "../show/popover";

@Component({
  selector: "show-thing",
  templateUrl: "show.html"
})
export class ShowThingPage {
  @ViewChild("thingStatus", { read: ViewContainerRef }) thingStatus: ViewContainerRef;
  homewatch: HomewatchApi;
  home: any;
  thing: any;
  status: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController, homewatchApiService: HomewatchApiService, public compFactoryResolver: ComponentFactoryResolver, public popoverCtrl: PopoverController, public events: Events) {
    this.homewatch = homewatchApiService.getApi();
    this.thing = this.navParams.data.thing;
    this.home = this.navParams.data.home;

    this.events.subscribe("things:updated", thing => {
      this.thing = thing;
      this.loadThingStatus();
    });
  }

  ionViewWillEnter() {
    this.events.subscribe(`thing:status:update:${this.thing.id}`, status => { this.onStatusChange(status); });

    this.loadThingStatus();
  }

  ionViewWillLeave() {
    this.events.unsubscribe(`thing:status:update:${this.thing.id}`);
    this.events.unsubscribe("things:updated");
  }

  async loadThingStatus() {
    try {
      const response = await this.homewatch.status(this.thing).getStatus();
      this.status = response.data;
      this.navParams.data.status = this.status;

      this.thingStatus.clear();
      const compFactory = this.compFactoryResolver.resolveComponentFactory(ThingsInfoHelper.getThingInfo(this.thing.type).showPage);
      const instance = this.thingStatus.createComponent(compFactory).instance;
      instance["readOnly"] = true;
    } catch (error) {
      this.status = undefined;
    }
  }

  async onStatusChange(newStatus) {
    try {
      const response = await this.homewatch.status(this.thing).putStatus(newStatus);
      this.status = response.data;
    } catch (error) {
      this.status.locked = !this.status.locked;
      this.showErrorToast("Couldn't change the device status");
    }
  }

  showErrorToast(message: string) {
    this.toastCtrl.create({
      message,
      duration: 3000,
      showCloseButton: true
    }).present();
  }

  async showPopover(myEvent) {
    const popover = this.popoverCtrl.create(ShowThingPopoverPage, { home: this.home, thing: this.thing });

    popover.onDidDismiss(async deleted => {
      if (deleted) this.navCtrl.setRoot(ShowHomePage, { home: this.home });
    });

    popover.present({ ev: myEvent });
  }
}
