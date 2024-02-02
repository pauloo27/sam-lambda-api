import { Entity, Column, Relation, JoinColumn, OneToOne } from 'typeorm';
import { MenuItem } from './menu-item';
import { Order } from './order';

@Entity({ name: 'order_menu_item' })
export class OrderMenuItem {
    @Column({ type: 'bigint', primary: true })
    orderId!: number;

    @Column({ type: 'bigint', primary: true })
    menuItemId!: number;

    @Column({ type: 'int' })
    amount!: number;

    @OneToOne(() => Order)
    @JoinColumn({ name: 'orderId', referencedColumnName: 'id' })
    order!: Relation<Order>;

    @OneToOne(() => MenuItem)
    @JoinColumn({ name: 'menuItemId', referencedColumnName: 'id' })
    menuItem!: Relation<MenuItem>;
}
