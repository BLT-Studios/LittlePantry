import { makeAutoObservable } from 'mobx';

export default class UIStore {
  darkMode = false;
  loaded = true;

  constructor() {
    makeAutoObservable(this);
  }

  setDarkMode(dark: boolean) {
    this.darkMode = dark;
  }
}
