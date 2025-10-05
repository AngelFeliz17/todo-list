PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE tasks (
	id INTEGER NOT NULL, 
	task VARCHAR, 
	pic VARCHAR, 
	date VARCHAR, 
	is_done BOOLEAN NOT NULL, 
	PRIMARY KEY (id)
);
INSERT INTO tasks VALUES(1,'CV','https://res.cloudinary.com/dhtowydnk/image/upload/v1759681842/my_todo_app/jtavno3ojyewdsiehgw2.pdf','2025-10-06',0);
INSERT INTO tasks VALUES(2,'Iron Man','https://res.cloudinary.com/dhtowydnk/image/upload/v1759681858/my_todo_app/kckb3hputlqplnqk5zgq.jpg','2025-10-17',0);
INSERT INTO tasks VALUES(3,'Batman','https://res.cloudinary.com/dhtowydnk/image/upload/v1759681998/my_todo_app/mwzd1bcwfgu4r83ni0am.jpg','2025-10-08',0);
INSERT INTO tasks VALUES(4,'Play with my fiends','https://res.cloudinary.com/dhtowydnk/image/upload/v1759682601/my_todo_app/d6uzb5ga2rbhfnbzwyzb.jpg','2025-10-24',0);
CREATE INDEX ix_tasks_task ON tasks (task);
COMMIT;
