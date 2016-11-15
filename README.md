# Github pullrequest creator
Tiny scripts to create pullrequest for Github repo.

## Before run this script you need:
* Your console can run `git` command ([Download Git](https://git-scm.com/downloads))
* Your computer can run `node`, `npm` command ([Download nodejs](https://nodejs.org/en/download/))

## This script can:
- [X] Sync the repo in local
- [X] Create a new branch or checkout an exist branch
- [X] Modify serval files in the repo
- [X] Commit the change and push the new branch to remote
- [X] Send pullrequest according fork
- [X] Create mutilple pullrequests
- [ ] Wait a minute to send the next pullrequest
- [X] Git ignore the config and content repo with credential information 

## How to run the script:
1. clone this repo and install `npm packages`

   ```cmd
   npm install
   ```
2. Modify the pr-config.json
    
   * `count` - How many pullrequest you want to create
   * `modifyCount` - How many files you want to edit in each pullrequest
   * `period` - How long you want to wait between two pullrequests

   ```json
   {
     "user": {
         "name": "[Your GitHub username]",
         "token": "[Your GitHub token, REQUIRED if enable two facotr, IF no token, delete this line]",
         "password": "[If no token provided, enter your password here]"
     },
     "repo": {
         "owner": "[Your repo owner]",
         "name": "[Your repo name]"
     },
     "branch": {
         "prefix": "[Auto created branch's prefix]",
         "startNumber": 0
     },
     "base": {
         "owner": "[Your pr base repo's owner]",
         "branch": "[Your pr base repo's branch]"
     },
     "pr": {
         "title": "[Your pr's title]"
     },
     "count": 1,
     "modifyCount": 20,
     "period": 5
   }
   ```

3. Run script
   ```cmd
   npm start
   ```
