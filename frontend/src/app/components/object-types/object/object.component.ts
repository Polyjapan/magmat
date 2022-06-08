import {Component, OnInit} from '@angular/core';
import {CompleteObject, ObjectStatus, statusToString} from '../../../data/object';
import {ObjectsService} from '../../../services/objects.service';
import {ActivatedRoute, Router} from '@angular/router';
import {lastChild, storageLocationToString} from '../../../data/storage-location';
import {externalLoanToString} from 'src/app/data/external-loan';
import {ObjectLogWithUser} from '../../../data/object-log';
import Swal from 'sweetalert2';
import {CompleteObjectComment} from '../../../data/object-comment';
import {AuthService} from '../../../services/auth.service';
import {Observable} from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
    selector: 'app-object',
    templateUrl: './object.component.html',
    styleUrls: ['./object.component.css'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class ObjectComponent implements OnInit {
    object: CompleteObject;
    externalLoanToString = externalLoanToString;
    storageLocationToString = storageLocationToString;
    statusToString = statusToString;

    logs: Observable<ObjectLogWithUser[]>;
    comments: CompleteObjectComment[];
    comment: string;
    posting = false;
    private id: number;

    expandedElement: ObjectLogWithUser | null;

    constructor(private service: ObjectsService, private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    }

    logColumnsToDisplay = ['timestamp', 'target', 'user']

    get objectData(): [string, string, boolean, (string | number)[]?][] {
        const object = this.object.object;
        const objectType = this.object.objectType;

        const arr: [string, string, boolean, (string | number)[]?][] = [
            ['ASSET TAG', object.assetTag, false],
            ['CATÉGORIE', objectType.name, false, ['/', 'object-types', object.objectTypeId]],
            (object.description ?? objectType.description) ? ['DESCRIPTION', object.description ?? objectType.description, object.description === null || object.description === undefined] : undefined,
            object.inconvStorageLocation ? ['STOCKAGE (CONVENTION)', storageLocationToString(this.object.inconvStorageLocationObject), false, ['/', 'storages', lastChild(this.object.inconvStorageLocationObject).storageId]] : undefined,
            object.storageLocation ? ['STOCKAGE (ANNÉE)', storageLocationToString(this.object.storageLocationObject), false, ['/', 'storages', lastChild(this.object.storageLocationObject).storageId]] : undefined,
            this.object.partOfLoanObject ? ['EMPRUNT PARENT', this.object.partOfLoanObject?.externalLoan?.loanTitle, object.partOfLoan === null || object.partOfLoan === undefined, ['/', 'external-loans', this.object.partOfLoanObject.externalLoan.externalLoanId]] : undefined,
            object.reservedFor ? ['RÉSERVÉ POUR', (this.object.reservedFor.details.firstName + ' ' + this.object.reservedFor.details.lastName + ' (' + object.reservedFor + ')'), false] : undefined,
            object.plannedUse ? ['UTILISATION PRÉVUE', object.plannedUse, false] : undefined,
            object.depositPlace ? ['LIEU DE DÉPOSE', object.depositPlace, false] : undefined,
            ['ÉTAT ACTUEL', statusToString(object.status), false],
        ];

        return arr.filter(e => e);
    }

    ngOnInit() {
        this.route.paramMap.subscribe(map => {
            this.id = Number.parseInt(map.get('id'), 10);
            this.refresh();
        });
    }

    refresh() {
        this.service.getObjectById(this.id).subscribe(obj => this.object = obj);
        this.logs = this.service.getObjectLogs(this.id);
        this.loadComments();
    }

    dateFormat(_log: ObjectLogWithUser | CompleteObjectComment) {
        const log = _log as any;
        const date = log.objectLog ? log.objectLog.timestamp : log.objectComment.timestamp;

        if (typeof date === 'string') {
            return new Date(Date.parse(date)).toLocaleString();
        } else {
            return date.toLocaleString();
        }
    }

    loadComments() {
        this.comments = undefined;
        this.service.getObjectComments(this.id).subscribe(res => this.comments = res);
    }

    sendComment() {
        if (this.posting) {
            return;
        }

        this.posting = true;
        this.service.postObjectComment(this.id, this.comment).subscribe(success => {
            this.posting = false;
            this.comment = '';
            this.loadComments();
        }, err => this.posting = false);
    }

    delete() {
        Swal.fire({
            titleText: 'Es-tu certain de vouloir faire cela ?',
            html: 'Cette opération placera l\'objet dans un état final "Remisé" dont il ne pourra plus jamais sortir.<br>Il disparaitra également ' +
                'des listes d\'objets, mais pourra toujours être retrouvé avec son asset tag.<br>Son asset tag ne sera pas libéré.',
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non',
            showCancelButton: true, showConfirmButton: true
        }).then(res => {
            if (res.value === true) {
                this.service
                    .changeState(this.object.object.objectId, ObjectStatus.DELETED, this.auth.getToken().userId)
                    .subscribe(succ => {
                        Swal.fire(undefined, undefined, 'success');
                        this.router.navigate(['/', 'object-types', this.object.object.objectTypeId]);
                    }, err => {
                        Swal.fire('Erreur inconnue', undefined, 'error');
                        console.log(err);
                    });
            }
        });
    }
}
