import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderMenuItem } from './order-menu-item';

export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
}

@Entity({ name: 'order' })
export class Order {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id!: number;

    @Column({ type: 'varchar' })
    customerName!: string;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus;

    @OneToMany(() => OrderMenuItem, (orderMenuItem) => orderMenuItem.order, { cascade: true })
    orderItems!: Array<OrderMenuItem>;
}
