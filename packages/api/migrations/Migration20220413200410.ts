import { Migration } from '@mikro-orm/migrations';

export class Migration20220413200410 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `client_instance` (`id` int unsigned not null auto_increment primary key, `uuid` varchar(255) not null, `online` tinyint(1) not null default false, `state` varchar(255) not null default \'stopped\', `created_at` datetime not null, `last_active_at` datetime null, `updated_at` datetime not null) default character set utf8mb4 engine = InnoDB;');
  }

}
