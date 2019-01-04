import { ipcRenderer } from 'electron';

declare const angular: any;

const KEYCODES = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ENTER: 13
};

const itemHeight = 50;

export function compareFactory(property: string): (a: {}, b: {}) => number {
  return function compare(a: any, b: any) {
    if (a[property] < b[property]) return -1;
    if (a[property] > b[property]) return 1;
    return 0;
  };
}

export class ApplicationController {
  public worker: Worker = new Worker('dist/worker.js');
  public keys: any[] = [];
  public clips: any[] = [];
  public clipsOriginal: any[] = [];
  public selectedIndex: number = 0;
  public selectedClip: any;
  public store: any;
  public query: string = '';

  constructor(
    private $timeout: any,
    private $document: any,
    private $sce: any,
    private $filter: any
  ) {
    ipcRenderer.on('store-data', this.handler.bind(this));

    this.initWorker();
    this.keypressListener();
  }

  initWorker() {
    this.worker.onmessage = event => {
      this.$timeout(() => {
        this.selectedClip = this.$sce.trustAsHtml(event.data);
      });
    };
  }

  modelChangeHandler(): void {
    if (this.query.length > 2) {
      this.clips = this.$filter('filter')(this.clipsOriginal, this.query);
    } else {
      this.clips = this.clipsOriginal;
    }

    this.selectedIndex = 0;
    this.worker.postMessage(this.clips[this.selectedIndex].snippet);
  }

  isActive(clip: any): boolean {
    return this.clips[this.selectedIndex] === clip;
  }

  keypressListener() {
    this.$document.on('keydown', (event: any) => {
      switch (event.keyCode) {
        case KEYCODES.UP:
          event.preventDefault();
          if (this.selectedIndex - 1 >= 0) {
            this.selectedIndex--;
            this.afterSelectionChange();
          }
          break;
        case KEYCODES.DOWN:
          event.preventDefault();
          if (this.selectedIndex + 1 <= this.clips.length - 1) {
            this.selectedIndex++;
            this.afterSelectionChange();
          }
          break;
        case KEYCODES.ENTER:
          ipcRenderer.send('message', this.clips[this.selectedIndex].snippet);
          break;
      }
    });
  }

  public afterSelectionChange(): void {
    this.worker.postMessage(this.clips[this.selectedIndex].snippet);
    const element = document.getElementById(`snippet-${this.selectedIndex}`);
    if (element) {
      element.scrollIntoView();
    }
  }

  handler(event: any, store: any) {
    this.$timeout(() => {
      this.store = store;
      this.keys = Object.keys(store);
      this.clipsOriginal = Object.values(store)
        .sort(compareFactory('time'))
        .reverse();
      this.clips = this.clipsOriginal;
      this.worker.postMessage(this.clips[this.selectedIndex].snippet);
    });
  }
}

angular
  .module('demo', [])
  .controller('ApplicationController', ApplicationController);

angular.bootstrap(document.documentElement, ['demo']);
