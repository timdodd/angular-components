import {Component, Output, EventEmitter, Input, HostBinding} from '@angular/core';

@Component({
  selector: 'tw-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {

  @HostBinding('attr.type') @Input() type: 'success' | 'info' | 'warning' | 'danger' = 'success';
  @Input() message: string;
  @Input() details: string;
  @Output() close = new EventEmitter<void>();

  constructor() { }

  onClose(): void {
    this.close.emit();
  }
}
