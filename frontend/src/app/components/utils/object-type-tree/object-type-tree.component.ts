import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {StorageTree} from '../../../data/storage-location';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import {NestedTreeControl} from '@angular/cdk/tree';
import {ObjectTypeAncestry, ObjectTypeTree} from '../../../data/object-type';

@Component({
  selector: 'app-object-type-tree',
  templateUrl: './object-type-tree.component.html',
  styleUrls: ['./object-type-tree.component.css']
})
export class ObjectTypeTreeComponent implements OnInit {
  @Input() trees: ObjectTypeTree[];
  @Input() ancestry: ObjectTypeAncestry;

  private ancestryDatasource: MatTreeNestedDataSource<ObjectTypeAncestry> = new MatTreeNestedDataSource<ObjectTypeAncestry>();
  private ancestryControl = new NestedTreeControl<ObjectTypeAncestry>(node => [node.child]);

  private treeDatasource: MatTreeNestedDataSource<ObjectTypeTree> = new MatTreeNestedDataSource<ObjectTypeTree>();
  private treeControl = new NestedTreeControl<ObjectTypeTree>(node => node.children);

  constructor() { }

  get control() {
    return this.ancestry ? this.ancestryControl:this.treeControl;
  }
  get datasource() {
    return this.ancestry ? this.ancestryDatasource:this.treeDatasource;
  }

  ngOnInit(): void {
    this.reloadTree();
  }

  private reloadTree() {
    this.treeDatasource.data = this.trees;
    this.ancestryDatasource.data = [this.ancestry];
    if (this.ancestry) {
      let trees = this.ancestry;
      do {
        this.ancestryControl.expand(trees);
        trees = trees.child
      } while (trees);
    } else if (this.trees && this.trees.length === 1) {
      this.treeControl.expand(this.trees[0])
    }
  }

  treeHasChild = (_, node: ObjectTypeTree) => node.children.length > 0
  ancestryHasChild = (_, node: ObjectTypeAncestry) => {
    console.log(" has child ? ")
    console.log(node)
    return node.child != undefined
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reloadTree();
  }

}
