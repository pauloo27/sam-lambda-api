import { Entity, Column, OneToOne, Relation, JoinColumn } from 'typeorm';
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

    @OneToOne(() => Ingredient)
    @JoinColumn({ name: 'ingredientId', referencedColumnName: 'id' })
    ingredient!: Relation<Ingredient>;

    @OneToOne(() => MenuItem, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'menuItemId', referencedColumnName: 'id' })
    menuItem!: Relation<MenuItem>;
}
