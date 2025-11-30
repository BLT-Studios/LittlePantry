import { makeAutoObservable } from 'mobx';
import type UIStore from './uiStore';

export default class AppStore {
  constructor(private ui: UIStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get ready(): boolean {
    return this.ui.loaded;
  }
}
