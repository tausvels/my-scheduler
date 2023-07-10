# my-scheduler

# A. Running the script manually
```
cd my-scheduler
node script.js
```
# B. CRON job with BASH
1. Open terminal in bash, of if in MAC (it is default to zsh)

2. Type `which node` in terminal to get the path of the Node executable

3. Run `crontab -e` to edit the cron table

4. To exit the editor, hit `escape` followed by `:wq`

5. To remove the cron job, Run `crontab -e` to edit the cron table and delete the line you from the cron schedule and save & exit.

6. To see the output, in bash, you have to type `mail`

7. Do delete all the mail, open mbox in VS Code (it can be found in the user/[your user name])

8. Delete everthing and save the file as mail.txt

9. Run `sudo mv ~/mail.txt /var/mail/tausifkhan` in terminal

10. To STOPp the cron job, type this in the terminal: `open the crontab editor and put a # before the command`

## 1. e.g- Running the scrpt 4 times with 10 seconds intervals
1. Repeat process <strong>B (1-3) </strong>
2. Add the following line to the end of the file:
```
*/20 * * * * /usr/local/bin/node /full-path-to-script-file >> /full-path-to-log-file-where-you-wwant-to-save-the-log-file/logfile.log 2>&1
```
3. Exit the editor
4. Pase the following code and hit enter
```
counter=0
while [ $counter -lt 4 ]; do
  /usr/local/bin/node /Users/tausifkhan/Desktop/git_folders/my-scheduler/script.js
  sleep 10
  ((counter++))
done
```
5. In this example, the output of the script WILL NOT BE SAVED in the log file

## 2. e.g- Running the scrpt everyday at 2pm local time 4 times with 10 seconds intervals
1. Repeat process <strong>B (1-3) </strong>
2. Enter the following line:
```
counter=0
while [ $counter -lt 4 ]; do
  /usr/local/bin/node /Users/tausifkhan/Desktop/git_folders/my-scheduler/script.js 2>&1 | tee -a /Users/tausifkhan/Desktop/git_folders/my-scheduler/logfile.log
  sleep 10
  ((counter++))
done

```
Note* the `tee` command lets you outout both in the logfile and in the terminal
3. Hit escape in keyboard
4. Save and exit the edit by `:wq` and hit enter.
5. In this example, the output of the script WILL BE SAVED in the log file