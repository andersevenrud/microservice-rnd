import { Migration } from '@mikro-orm/migrations';

export class Migration20220413224046 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `client_instance` add `deleted_at` datetime null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `client_instance` drop `deleted_at`;');
  }

}
