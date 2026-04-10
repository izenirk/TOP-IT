"# TOP-IT хакатон-вайбкодинг"
{
  "database": {
    "name": "company_db",
    "tables": [
      {
        "name": "User",
        "columns": [
          {
            "name": "id",
            "type": "INTEGER",
            "constraints": ["PRIMARY KEY", "AUTOINCREMENT"]
          },
          {
            "name": "full_name",
            "type": "VARCHAR(255)",
            "constraints": ["NOT NULL"]
          },
          {
            "name": "login",
            "type": "VARCHAR(50)",
            "constraints": ["NOT NULL", "UNIQUE"]
          },
          {
            "name": "password",
            "type": "VARCHAR(255)",
            "constraints": ["NOT NULL"]
          },
          {
            "name": "group_id",
            "type": "INTEGER",
            "constraints": [
              "NOT NULL",
              "FOREIGN KEY REFERENCES EmployeeGroup(id)"
            ]
          },
          {
            "name": "role",
            "type": "ENUM('admin', 'manager', 'employee', 'supervisor')",
            "constraints": ["NOT NULL", "DEFAULT 'employee'"]
          },
          {
            "name": "created_at",
            "type": "DATETIME",
            "constraints": ["DEFAULT CURRENT_TIMESTAMP"]
          },
          {
            "name": "updated_at",
            "type": "DATETIME",
            "constraints": ["DEFAULT CURRENT_TIMESTAMP"]
          }
        ]
      }
    ]
  }
}

