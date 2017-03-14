FROM s390x/ibmnode

EXPOSE 3000

COPY . /app

WORKDIR /app

RUN npm install

CMD node bin/www
