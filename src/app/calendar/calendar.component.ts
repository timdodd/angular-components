import {Component, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, OnInit, Output} from '@angular/core';
import {DateTime} from 'luxon';

@Component({
  selector: 'tw-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnChanges {

  @Output() change = new EventEmitter<string>();
  @Output() calendarMonthChange = new EventEmitter<string>();
  @Output() calendarYearChange = new EventEmitter<string>();
  @Input() value: string;
  @Input() minDate;
  @Input() maxDate;

  calendarCells: CellMetadata[] = [];
  weekdayLabels: string[];
  navigationDate: DateTime;

  constructor(@Inject(LOCALE_ID) private locale: string) {
  }

  ngOnInit(): void {
    this.initializeDaysOfWeek();
    this.initializeNavigationDate();
  }

  ngOnChanges(): void {
    this.refreshCells();
  }

  changeMonth(num: number): void {
    this.updateNavigationDate(this.navigationDate.plus({months: num}));
  }

  changeYear(num: number): void {
    this.updateNavigationDate(this.navigationDate.plus({years: num}));
  }

  selectDate(cell: CellMetadata): void {
    if (!cell.disabled && cell.isoDate) {
      this.value = cell.isoDate;
      this.change.emit(this.value);
    }
  }

  get navigationYearLabel(): string {
    return this.navigationDate.setLocale(this.locale).toFormat('yyyy');
  }

  get navigationMonthLabel(): string {
    return this.navigationDate.setLocale(this.locale).toFormat('MMM');
  }

  private initializeDaysOfWeek(): void {
    this.weekdayLabels = [0, 1, 2, 3, 4, 5, 6].map(i => DateTime.local().set({weekday: i}).setLocale(this.locale).toFormat('ccc'));
  }

  private initializeNavigationDate(): void {
    const currentDate = DateTime.local();
    let initialNavigationDate = currentDate;
    if (this.maxDate && this.maxDate < currentDate.toISODate()) {
      initialNavigationDate = DateTime.fromISO(this.maxDate).startOf('month');
    } else if (this.minDate && this.minDate > currentDate.toISODate()) {
      initialNavigationDate = DateTime.fromISO(this.minDate).startOf('month');
    } else {
      initialNavigationDate = currentDate.startOf('month');
    }
    this.updateNavigationDate(initialNavigationDate);
  }

  private updateNavigationDate(value: DateTime): void {
    this.navigationDate = value;
    this.refreshCells();
  }

  private refreshCells(): void {
    const firstDay = this.navigationDate.startOf('month');
    const lastDay = this.navigationDate.endOf('month');
    const daysInMonth = lastDay.get('day');
    const firstEmptyCells = firstDay.get('weekday') % 7;
    const lastEmptyCells = 6 - lastDay.get('weekday') < 0 ? 0 : 6 - lastDay.get('weekday');

    const dayOfMonthCells = this.createNCells(daysInMonth, i => {
      const dayIndex = i + 1;
      const isoDate = this.navigationDate.set({day: dayIndex}).toISODate();
      return {
        isoDate: isoDate,
        day: dayIndex,
        today: isoDate === DateTime.local().toISODate(),
        disabled: false
      } as CellMetadata;
    });

    this.calendarCells = this.createNEmptyCells(firstEmptyCells)
      .concat(dayOfMonthCells)
      .concat(this.createNEmptyCells(lastEmptyCells));
  }

  private createNCells(numberOfCells: number, cellMapper: (index: number) => CellMetadata): CellMetadata[] {
    return !numberOfCells ? [] : [...Array(numberOfCells)].map((_, i) => cellMapper(i));
  }

  private createNEmptyCells(numberOfCells: number): CellMetadata[] {
    return this.createNCells(numberOfCells, () => {
      return {
        disabled: true
      } as CellMetadata;
    });
  }
}

export class CellMetadata {
  isoDate: string;
  day: number;
  today: boolean;
  disabled: boolean;
}
