import {Component, ViewChild, AfterViewInit, signal, OnDestroy} from '@angular/core';
import {DayPilot, DayPilotModule, DayPilotSchedulerComponent} from '@daypilot/daypilot-lite-angular';
import {DataService} from './data.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'scheduler-component',
  standalone: true,
  imports: [DayPilotModule],
  providers: [DataService],
  template: `

    <div class="toolbar">
        <button (click)="previous()">Previous</button>
        <button (click)="today()">Today</button>
        <button (click)="next()">Next</button>
    </div>
      <daypilot-scheduler [config]="config()" [events]="events()" (viewChange)="schedulerViewChanged($event)" #scheduler></daypilot-scheduler>

  `,
  styles: [`
    .toolbar {
        margin: 10px 0px;
    }

    .toolbar button {
        background-color: #f3f3f3;
        border: 1px solid #c0c0c0;
        color: #333;
        padding: 8px 0px;
        width: 100px;
        border-radius: 2px;
        cursor: pointer;
        margin-right: 5px;
    }

  `]
})
export class SchedulerComponent implements AfterViewInit, OnDestroy {

  @ViewChild('scheduler', {static: true})
  scheduler!: DayPilotSchedulerComponent;

  events = signal<DayPilot.EventData[]>([]);
  private eventRequest?: Subscription;

  config = signal<DayPilot.SchedulerConfig>({
    timeHeaders: [{"groupBy":"Month"},{"groupBy":"Day","format":"d"}],
    scale: "Day",
    rowHeaderWidth: 125,
    days: DayPilot.Date.today().daysInMonth(),
    startDate: DayPilot.Date.today().firstDayOfMonth(),
    timeRangeSelectedHandling: "Enabled",
    onTimeRangeSelected: async (args) => {
      const dp = args.control;
      const modal = await DayPilot.Modal.prompt("Create a new event:", "Event 1");
      dp.clearSelection();
      if (modal.canceled) { return; }
      dp.events.add({
        start: args.start,
        end: args.end,
        id: DayPilot.guid(),
        resource: args.resource,
        text: modal.result
      });
    },
  });

  constructor(private ds: DataService) {
  }

  ngAfterViewInit(): void {
    this.ds.getResources().subscribe(result => {
      this.config.update(c => ({ ...c, resources: result }));
    });
  }

  previous(): void {
    const startDate = new DayPilot.Date(this.config().startDate!).addMonths(-1);
    this.config.update(c => ({ ...c, startDate, days: startDate.daysInMonth() }));
  }

  today(): void {
    const startDate = DayPilot.Date.today().firstDayOfMonth();
    this.config.update(c => ({ ...c, startDate, days: startDate.daysInMonth() }));
  }

  next(): void {
    const startDate = new DayPilot.Date(this.config().startDate!).addMonths(1);
    this.config.update(c => ({ ...c, startDate, days: startDate.daysInMonth() }));
  }

  schedulerViewChanged(args: {visibleRangeChanged: boolean}): void {
    if (args.visibleRangeChanged) {
      const from = this.scheduler.control.visibleStart();
      const to = this.scheduler.control.visibleEnd();
      this.eventRequest?.unsubscribe();
      this.events.set([]);
      this.eventRequest = this.ds.getEvents(from, to).subscribe(result => {
        this.events.set(result);
      });
    }
  }

  ngOnDestroy(): void {
    this.eventRequest?.unsubscribe();
  }

}
