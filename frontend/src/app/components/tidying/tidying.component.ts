import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ObjectsService} from '../../services/objects.service';
import {GenericTidyingTree, TidyingTree} from '../../data/tidying';
import {CompleteObject, SingleObject} from '../../data/object';
import {debounceTime, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';
import {MatSlider} from '@angular/material/slider';
import {combineLatest} from 'rxjs';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';

@Component({
  selector: 'app-tidying',
  templateUrl: './tidying.component.html',
  styleUrls: ['./tidying.component.css']
})
export class TidyingComponent implements OnInit, AfterViewInit {
  tree: TidyingTree[];
  treeDataSource: MatTreeNestedDataSource<GenericTidyingTree<any> | SingleObject>;

  invert = false;

  @ViewChild('leftDepth') leftDepth: MatSlider;
  @ViewChild('rightDepth') rightDepth: MatSlider;
  linked: boolean = true;
  treeControl = new NestedTreeControl<GenericTidyingTree<any> | SingleObject>(node => {
    if (node) {
      if (Reflect.has(node, 'leaf')) {
        const leaf = (node as GenericTidyingTree<any>).leaf;
        if (Reflect.has(leaf, 'length')) {
          return leaf as SingleObject[];
        } else {
          return leaf as GenericTidyingTree<any>[];
        }
      } else if (Reflect.has(node, 'node')) {
        return (node as GenericTidyingTree<any>).node as GenericTidyingTree<any>[];
      } else {
        return [];
      }
    }
  });

  constructor(private os: ObjectsService) {
  }

  hasChild = (_, node: GenericTidyingTree<any> | SingleObject) => !Reflect.has(node, 'length') && !Reflect.has(node, 'objectId');

  /*

  constructor() { }

  ngOnInit(): void {
    this.datasource.data = this.trees;

    if (this.expandSingle) {
      let trees = this.trees;
      while (trees.length === 1) {
        this.treeControl.expand(trees[0]);
        trees = trees[0].children
      }
    } else if (this.trees.length === 1) {
      this.treeControl.expand(this.trees[0])
    }

  }

  hasChild = (_, node: StorageTree) => node.children.length > 0

   */

  reload() {
    this.tree = undefined;
    this.treeDataSource = undefined;
  }

  ngOnInit() {
    this.reload();

  }

  displayObject(item: CompleteObject) {
    return item.objectType.name + ' ' + item.object.suffix;
  }

  formatLabel(value: number) {
    if (value >= 10) {
      return '\u221E';
    }

    return value;
  }

  ngAfterViewInit(): void {
    this.leftDepth.change.subscribe(v => {
      if (this.linked) {
        this.rightDepth.value = v.value;
        this.rightDepth.valueChange.next(v.value);
      }
    });

    combineLatest(this.leftDepth.valueChange, this.rightDepth.valueChange, (n1, n2) => [n1, n2])
      .pipe(
        tap(v => console.log('changes ' + v)),
        distinctUntilChanged(), debounceTime(100),
        tap(v => console.log('distinct ' + v)),
        switchMap(pair => {
          const [l, r] = pair;
          return this.os.getTidyingData(this.invert, l >= 10 ? -1 : l, r >= 10 ? -1 : r).pipe(tap(tree => console.log(tree)));
        })
      ).subscribe(tree => {
      this.tree = tree;
      this.treeDataSource = new MatTreeNestedDataSource<GenericTidyingTree<any> | SingleObject>();
      this.treeDataSource.data = tree;
    });

    // Force our way
    this.leftDepth.valueChange.next(5);
    this.rightDepth.valueChange.next(5);
  }
}
