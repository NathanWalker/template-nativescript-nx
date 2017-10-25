import { Component, OnInit } from '@angular/core';

import { Item } from '../../models';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'ns-items',
  moduleId: module.id,
  templateUrl: './items.component.html'
})
export class ItemsComponent implements OnInit {
  items: Item[];

  // This pattern makes use of Angular’s dependency injection implementation to inject an instance of the ItemService service into this class.
  // Angular knows about this service because it is included in your app’s CoreModule.
  // Providing it via the CoreModule ensures it's a singleton across the entire app
  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.items = this.itemService.getItems();
  }
}
