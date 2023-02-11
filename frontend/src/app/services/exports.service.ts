import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, shareReplay, switchMap, take } from 'rxjs/operators';
import { Guest } from '../data/guest';
import { saveAs } from 'file-saver'

@Injectable({ providedIn: 'root' })
export class ExportsService {
  constructor(private http: HttpClient) {
  }

  private async downloadExport(path: string, filename: string) {
    const parts = path.split('/')
    const blob = await this.http.get(`${environment.apiurl}/export/${path}`, { responseType: "blob" })
      .pipe(take(1)).toPromise()

    saveAs(blob, filename)
  }

  async exportAll() {
    return this.downloadExport('all.pdf', 'all.pdf')
  }

  async exportStorage(id: number) {
    return this.downloadExport(`storage/${id}.pdf`, `storage-${id}`)
  }

  async exportCategory(id: number) {
    return this.downloadExport(`type/${id}.pdf`, `type-${id}`)
  }
}
