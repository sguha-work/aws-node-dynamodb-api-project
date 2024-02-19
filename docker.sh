# sudo docker rm -f aws-node-dynamodb-api-project
# sudo docker rmi -f $(sudo docker images -f "dangling=true" -q)
# sudo docker build -t sguha1988/aws-node-dynamodb-api-project . --label aws-node-dynamodb-api-project
# docker image prune --force --filter='label=aws-node-dynamodb-api-project'
# sudo docker run --name aws-node-dynamodb-api-project -p 9000:9000 -d sguha1988/aws-node-dynamodb-api-project