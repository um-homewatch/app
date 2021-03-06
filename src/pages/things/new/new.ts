import { NewThingPopoverPage } from './popover';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomewatchApi } from 'homewatch-js';
import { Events, NavController, NavParams, PopoverController } from 'ionic-angular';

import { ThingsInfoHelper } from '../../../helpers/things_info';
import { HomewatchApiService } from '../../../services/homewatch_api';

@Component({
  selector: "page-new-thing",
  templateUrl: "new.html"
})
export class NewThingPage {
  editMode = false;
  thingForm: FormGroup;
  typeOptions: Array<Object>;
  subTypeOptions: Array<string> = [];
  homewatch: HomewatchApi;
  submitted = false;
  home: any;
  thing: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, homewatchApi: HomewatchApiService, public formBuilder: FormBuilder, public events: Events, public popoverCtrl: PopoverController) {
    this.homewatch = homewatchApi.getApi();
    this.typeOptions = ThingsInfoHelper.getTypeOptions();

    this.thingForm = formBuilder.group({
      id: [""],
      name: ["", Validators.required],
      type: ["", Validators.required],
      subtype: ["", Validators.required],
      connection_info: formBuilder.group({
        address: ["", Validators.required],
        port: [""]
      }),
      extra_info: [""]
    });

    this.thingForm.valueChanges.subscribe(data => {
      if (data.type) this.subTypeOptions = ThingsInfoHelper.getThingInfo(data.type).subTypes;
    });
  }

  ionViewWillEnter() {
    this.home = this.navParams.get("home");
    this.thing = this.navParams.get("thing");

    if (this.thing) {
      this.editMode = true;
      const extraInfo = {... this.thing.connection_info};
      delete extraInfo["address"];
      delete extraInfo["port"];

      this.thingForm.setValue({
        id: this.thing.id,
        name: this.thing.name,
        type: this.thing.type,
        subtype: this.thing.subtype,
        connection_info: {
          address: this.thing.connection_info.address,
          port: this.thing.connection_info.port || ""
        },
        extra_info: JSON.stringify(extraInfo)
      });
    }
  }

  async onSubmit(form: FormGroup) {
    Object.assign(form.value.connection_info, JSON.parse(form.value.extra_info));
    if (this.editMode) {
      const response = await this.homewatch.things(this.home).updateThing(form.value.id, form.value);
      this.events.publish("things:updated", response.data);
    } else {
      await this.homewatch.things(this.home).createThing(form.value);
    }
    this.navCtrl.pop();
  }

  async showPopover(myEvent) {
    const popover = this.popoverCtrl.create(NewThingPopoverPage, {
      callback: this.popoverCallback,
      home: this.home,
      discoveryParams: this.buildDiscoveryParams()
    });

    popover.present({
      ev: myEvent
    });
  }

  private buildDiscoveryParams() {
    return {
      type: this.thingForm.value.type,
      subtype: this.thingForm.value.subtype,
      port: this.thingForm.value.connection_info.port
    };
  }

  private popoverCallback = async data => {
    const connection_info = (({ address, port }) => ({ address, port }))(data);
    delete data.address;
    delete data.port;
    delete data.type;
    delete data.subtype;

    this.thingForm.patchValue({
      connection_info,
      extra_info: JSON.stringify(data)
    });
  }
}
