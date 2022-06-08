# Object type creation

- If loan, then adding the items is optional
    - need a view in loans when taking the loan ("label the items, count them, and scan them")
- Check if autocomplete works well
- Maybe don't allow loans in the main creation form? Use a dedicated form with one row per item?

# Convention setup

- scan an item and set location + add checkbox "move all items of same type" (more efficient)


# Usecases to add items

1. Do an inventory pre JI
    - Know some of the items
    - Know where they are offconv
    - Don't know where they'll be inconv
2. Prepare some loans pre JI
    - Know some of the items
    - Know where they come from
    - Don't know where they'll be inconv
3. Add some items during JI
    - Know where they go
    - Should know where they come from / what loan they are part of
4. Planify pre-JI
    - Set the location of the items one by one
5. Setup MagMat during JI
    - Must be fast!
    - ==> Group edit (scan one laptop, say where it goes, tick the box "set the object type location" to update all)
6. Add items pre JI knowing where they go
    - 1/2 + 4, merged
    
## Interfaces to add/update items

### 1. Fast loan generation (usecase 2)

- Create loan and items at the same time
- Provide loan info
- Add one line per item type, with only name and description

### 2. Full item creation (usecases 1, 3, 6)

- Create the item type
- Provide _optional_ location and loan -- they can ALL be null.
- Two buttons: create and stay here OR create and add items (brings to the barcode creation page)

### 3. Quick item update (usecase 5)

_This process is only used for items that are already in the system. For new items, one should use the full item creation form (2). There is no faster process available._

- Scan page with three fields:
    - Target location (-> inconv location)
    - Checkbox: change all items of type
    - Barcode
- When a barcode is entered and submitted, the two other fields stay still. A confirmation is displayed and the barcode field is emptied.

### 4. Slow item update (usecase 4)

- Just the update page on the item


# Random thoughts

- Won't be used by logistics to handle loans and movements during year
    - We should still ask them to keep updated
- Forks/Knives... 
    - => won't create one item for each?
    - set as disposables ?
        - or add a status USED
        - or just use the LOST status

    
