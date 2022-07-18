# virtual-agent-api
Connect to the database:
- Install MySQL Workbench or any similar tools.
- Create a new db connection with these credentials: 
    "username": "admin",
    "password": "Kingsbury22",
    "database": "VADB",
    "host": "vadb.cxatogwo2mxx.ap-southeast-2.rds.amazonaws.com",

![image](https://user-images.githubusercontent.com/95118667/179451614-eadf275e-5220-43af-9716-7f564f1d9113.png)

- This will connect to our db on AWS RDS. If you go to Schemas->Tables, you could see our Entities (sample database).
![image](https://user-images.githubusercontent.com/95118667/179451819-6e9ba232-59d2-44e9-97b7-fbe17bdf2878.png)

Deployment materials:
- AWS account: 
    userName:  coo@mentor-plus.com.au
    password:  y^!d8cr9^-}kRTGL
- Database: AWS RDS
- Back-end: AWS EC2 (t2.micro)
- Front-end: S3 Bucket.
