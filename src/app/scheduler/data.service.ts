import {Injectable} from '@angular/core';
import {DayPilot} from '@daypilot/daypilot-lite-angular';
import {HttpClient} from '@angular/common/http';
import {Observable, of, delay} from 'rxjs';

@Injectable()
export class DataService {

  resources: DayPilot.ResourceData[] = [
    { name: 'Resource 1', id: 'R1' },
    { name: 'Resource 2', id: 'R2' },
    { name: 'Resource 3', id: 'R3' },
    { name: 'Resource 4', id: 'R4' }
  ];

  private month = DayPilot.Date.today().firstDayOfMonth();

  events: DayPilot.EventData[] = [
    {
      id: '1',
      resource: 'R1',
      start: this.month.addDays(2),
      end: this.month.addDays(7),
      text: 'Event 1'
    },
    {
      id: '2',
      resource: 'R2',
      start: this.month.addDays(1),
      end: this.month.addDays(4),
      text: 'Event 2'
    },
    {
      id: '3',
      resource: 'R2',
      start: this.month.addDays(5),
      end: this.month.addDays(8),
      text: 'Event 3'
    }
  ];

  constructor(private http: HttpClient) {
  }

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<DayPilot.EventData[]> {

    // Simulate a server that returns events overlapping [from, to).
    const events = this.events.filter(event =>
      new DayPilot.Date(event.start) < to && new DayPilot.Date(event.end) > from
    );
    return of(events).pipe(delay(200));

    // return this.http.get("/api/events?from=" + from.toString() + "&to=" + to.toString());
  }

  getResources(): Observable<DayPilot.ResourceData[]> {

    return of(this.resources).pipe(delay(200));

    // return this.http.get("/api/resources");
  }

}
