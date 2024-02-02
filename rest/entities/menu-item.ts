import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MenuItemIngredient } from './menu-item-ingredient';

@Entity({ name: 'menu_item' })
export class MenuItem {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id!: number;

    @Column({ unique: true, type: 'varchar' })
    name!: string;

    @OneToMany(() => MenuItemIngredient, (menuItemIngredient) => menuItemIngredient.menuItem, { cascade: true })
    ingredients!: Array<MenuItemIngredient>;
}
