var express = require('express'),
    router = express.Router(),
    request = require('request'),
    log = require('bunyan').createLogger({name: 'premade'});

router.get('/summoner/:region/:id', function(req, res) {
  var region = req.params.region,
      id = Number(req.params.id);
  request('https://' + region + '.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/'
  + toPlatform(region) + '/' + id + '?api_key=' + process.env.KEY, function(e, r, b) {
    if(e) {
      log.error(e);
      res.json({success: false});
    } else {
      if(r.statusCode == 200) {
        var game = JSON.parse(b),
            ids = [];
        for(var i = 0, len = game.participants.length; i < len; i++) {
          ids.push(game.participants[i].summonerId);
        }
        getMatchlists(ids, region, [], function(e, matchlists) {
          res.json(matchlists.length);
        });
      } else {
        log.error(r.statusCode);
        res.status(r.statusCode);
        res.send('Nope');
      }
    }
  });
});

function getMatchlists(ids, region, matchlists, cb) {
  request('https://' + region + '.api.pvp.net/api/lol/' + region + '/v2.2/matchlist/by-summoner/'
  + ids[0] + '?api_key=' + process.env.KEY, function(e, r, b) {
    if(e) {
      log.error(e);
    } else {
      if(r.statusCode == 200) {
        b = JSON.parse(b);
        matchlists.push(b.matches);
        ids.shift();
        if(ids.length) {
          getMatchlists(ids, region, matchlists, cb);
        } else {
          cb(null, matchlists);
        }
      } else {
        log.error(r.statusCode);
      }
    }
  });
}

function toPlatform(region) {
  return {
    eune: 'EUN1',
    euw: 'EUW1',
    br: 'BR1',
    jp: 'JP1',
    kr: 'KR',
    lan: 'LA1',
    las: 'LA2',
    na: 'NA1',
    oce: 'OC1',
    ru: 'RU',
    tr: 'TR1'
  }[region];
};

module.exports = router;