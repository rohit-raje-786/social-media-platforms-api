# social-media-platforms-api

An social media platform api where the user can perform following operations
1.POST /api/authenticate should perform user authentication and return a JWT token.</br>
2.POST /api/follow/{id} authenticated user would follow user with {id}</br>
3.POST /api/unfollow/{id} authenticated user would unfollow a user with {id}</br>
4.GET /api/user should authenticate the request and return the respective user profile.</br>
5.POST api/posts/ would add a new post created by the authenticated user.</br>
6.DELETE api/posts/{id} would delete post with {id} created by the authenticated user.</br>
7.POST /api/like/{id} would like the post with {id} by the authenticated user.</br>
8.POST /api/unlike/{id} would unlike the post with {id} by the authenticated user.</br>
9.POST /api/comment/{id} add comment for post with {id} by the authenticated user.</br>
10.GET api/posts/{id} would return a single post with {id} populated with its number of likes and comments</br>
11.GET /api/all_posts would return all posts created by authenticated user sorted by post time.</br>

## To Run the application

1.npm i
2.npm start

## To Run the test

1.npm test

## To Run using docker pull the docker image

1.docker pull rohitraje/social-media-platform-api
