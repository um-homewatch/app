import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";

import { MyApp } from "./app.component";
import { LoginPage } from "../pages/login/login";
import { SignUpPage } from "../pages/sign-up/sign-up";
import { EditProfilePage } from "../pages/sign-up/edit";
import { ListHomesPage } from "../pages/homes/list/list";
import { NewHomePage } from "../pages/homes/new/new";
import { ListThingsPage } from "../pages/things/list/list";
import { NewThingPage } from "../pages/things/new/new";

import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { IonicStorageModule } from "@ionic/storage";
import { HomewatchApiService } from "../services/homewatch_api";

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignUpPage,
    ListHomesPage,
    NewHomePage,
    ListThingsPage,
    NewThingPage,
    EditProfilePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignUpPage,
    ListHomesPage,
    NewHomePage,
    ListThingsPage,
    NewThingPage,
    EditProfilePage
  ],
  providers: [
    HomewatchApiService,
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
