import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

enum OrderStatus {
    PENDING,
    COMPLETED,
}

@Entity({ name: 'order' })
export class Order {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id!: number;

    @Column({ type: 'varchar' })
    customerName!: string;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus;
}
