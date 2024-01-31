import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'ingredient' })
export class Ingredient {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id!: number;

    @Column({ unique: true, type: 'varchar' })
    name!: string;

    @Column({ type: 'int' })
    availableAmount!: number;
}
