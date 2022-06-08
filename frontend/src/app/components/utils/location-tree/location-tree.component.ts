import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {StorageTree} from '../../../data/storage-location';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';

@Component({
  selector: 'app-location-tree',
  templateUrl: './location-tree.component.html',
  styleUrls: ['./location-tree.component.css']
})
export class LocationTreeComponent implements OnInit, OnChanges {
  @Input() trees: StorageTree[];
  @Input() expandSingle: boolean = false;

  query: string;

  datasource: MatTreeNestedDataSource<StorageTree> = new MatTreeNestedDataSource<StorageTree>();
  treeControl = new NestedTreeControl<StorageTree>(node => node.children);

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

  ngOnChanges(changes: SimpleChanges): void {
    this.datasource.data = this.trees;
  }

}
