# social_channel_notifier

> Send push notification if a social channel like reddit, hn has an post which outruns a specific upvote threshold

## deploy cron

```
cd appengine
gcloud app deploy app.yaml cron.yaml
```

## deploy firebase fn
```
cd function
firebase deploy --only functions
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
