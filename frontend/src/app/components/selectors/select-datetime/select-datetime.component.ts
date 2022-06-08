import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {NgModel} from '@angular/forms';

@Component({
  selector: 'app-select-datetime',
  templateUrl: './select-datetime.component.html',
  styleUrls: ['./select-datetime.component.css']
})
export class SelectDatetimeComponent implements OnInit, OnChanges {
  @Input() label: string;
  @Input() selected;

  selectedDate: Date;
  selectedTime: string;

  @Output() selectedChange = new EventEmitter<Date>();

  constructor() {
  }

  get selectedAsDate() {
    if (typeof this.selected === 'string') {
      return new Date(Date.parse(this.selected));
    } else {
      return this.selected as Date;
    }
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selected) {
      // Parse selected
      const dte = this.selectedAsDate;
      if (dte) {
        if (!this.selectedDate) {
          this.selectedDate = dte;
        }
        if (!this.selectedTime) {
          this.selectedTime = dte.toLocaleTimeString();
        }
      }
    }
  }

  onChange($event, dateField: NgModel, timeField: NgModel) {
    if (this.selectedDate && this.selectedTime) {
      // Parse time
      try {
        const parts = this.selectedTime.split(':');
        const hours = Number.parseInt(parts[0], 10);
        const minutes = parts.length >= 2 ? Number.parseInt(parts[1], 10) : 0;
        const seconds = parts.length >= 3 ? Number.parseInt(parts[2], 10) : 0;

        if (parts.length > 3 || hours < 0 || hours > 23 || minutes > 59 || seconds > 59 || minutes < 0 || seconds < 0 || isNaN(hours) ||
          isNaN(minutes) || isNaN(seconds)) {
          this.selectedChange.emit(undefined);
          timeField.control.setErrors({invalid: true});
          return; // Invalid format
        }

        const dte = new Date(this.selectedDate);
        dte.setHours(hours, minutes, seconds, 0);

        console.log(this.selectedDate);
        console.log(dte);

        this.selectedChange.emit(dte);
        timeField.control.setErrors(null);
      } catch (e) {
        this.selectedChange.emit(undefined);
        timeField.control.setErrors({invalid: true});
      }
    } else {
      this.selectedChange.emit(undefined);
    }
  }
}
