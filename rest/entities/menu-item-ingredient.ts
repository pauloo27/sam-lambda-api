import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Ingredient } from './ingredient';
import { MenuItem } from './menu-item';

@Entity({ name: 'menu_item_ingredient' })
export class MenuItemIngredient {
    @Column({ type: 'bigint', primary: true })
    ingredientId!: number;

    @Column({ type: 'bigint', primary: true })
    menuItemId!: number;

    @Column({ type: 'int' })
    amount!: number;

    @ManyToOne(() => Ingredient)
    @JoinColumn({ name: 'ingredientId' })
    ingredient!: Ingredient;

    @ManyToOne(() => MenuItem, menuItem => menuItem.ingredients, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'menuItemId' })
    menuItem!: MenuItem;
}
