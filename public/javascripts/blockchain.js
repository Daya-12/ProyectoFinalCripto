var difficulty = 3;        // number of zeros required at front of hash
var maximumNonce = 5000000; // limit the nonce to this so we don't mine too long

/////////////////////////
// global variable setup
/////////////////////////
var pattern = '';
for (var x=0; x<difficulty; x++) {
  pattern += '0';
}

/////////////////////////
// functions
/////////////////////////
function sha512(block, chain, merkleRoot) {
  // calculate a SHA512 hash of the contents of the block
  return CryptoJS.SHA512(getText(block, chain, merkleRoot));
}
function MD5(md5) {
  // calculate a MD5 hash of the contents of the block
  return CryptoJS.MD5(md5);
}


function updateState(block, chain) {
  // set the card background red or green for this block
  if ($('#block'+block+'chain'+chain+'hash').val().substr(0, difficulty) === pattern) {
    $('#block'+block+'chain'+chain+'well').removeClass('well-error').addClass('well-success');
  }
  else {
    $('#block'+block+'chain'+chain+'well').removeClass('well-success').addClass('well-error');
  }
}


function updateHash(block, chain) {
  // update the SHA512 hash value for this block
  $('#block'+block+'chain'+chain+'hash').val(sha512(block, chain));
  updateState(block, chain);
}

function updateHashMD5(block, chain, valcomp) {
  // update the MD5 hash value for this block
  updateState(block, chain);
}

function updateChain(block, chain) {
  // update all blocks walking the chain from this block to the end
  for (var x = block; x <= 5; x++) {
    if (x > 1) {
      $('#block'+x+'chain'+chain+'previous').val($('#block'+(x-1).toString()+'chain'+chain+'hash').val());
    }
    updateHash(x, chain);
  }
}
function updateChainMD5(block, chain, valcomp) {
  // update all blocks walking the chain from this block to the end
  for (var x = block; x <= 5; x++) {
    if (x > 1) {
      $('#block'+x+'chain'+chain+'previous').val($('#block'+(x-1).toString()+'chain'+chain+'hash').val());
    }
    updateHashMD5(x, chain, valcomp);
  }
}

function calculateMerkleRoot(hashes) {
  if (hashes.length === 1) {
    return hashes[0];
  }

  if (hashes.length % 2 !== 0) {
    hashes.push(hashes[hashes.length - 1]);
  }

  let newHashes = [];
  for (let i = 0; i < hashes.length; i += 2) {
    newHashes.push(CryptoJS.SHA512(hashes[i] + hashes[i + 1]).toString());
  }

  return calculateMerkleRoot(newHashes);
}


function mine(block, chain, isChain) {
  let transactions = [];
  let datos = "";
  let trans = "";
  var merkleRoot = "";
  let valcomp = "";

  var element = $('#block' + block + 'chainAtx15seq');
  if (element.length > 0) {
    for (var x = 0; x <= 15; x++) {
      datos = $('#block'+block+'chainAtx'+x+'sig').val();
      transactions.push(datos);
      trans += datos;
    }
    merkleRoot = calculateMerkleRoot(transactions);
  }
  for (var nonce = 0; nonce <= maximumNonce; nonce++) {
    if (transactions.length > 0) {
      valcomp = nonce + merkleRoot + trans;
      $('#block'+block+'chain'+chain+'nonce').val(MD5(valcomp));
      $('#block'+block+'chain'+chain+'hash').val(sha512(block, chain, merkleRoot));

      if ($('#block'+block+'chain'+chain+'hash').val().substr(0, difficulty) === pattern) {
        if (isChain) {
          updateChainMD5(block, chain, valcomp);
        }
        else {
          updateState(block, chain);
        }
        break;
      }
    }else{
      var ant = $('#block'+block+'chain'+chain+'previous').val();
      valcomp = nonce + ant;

      $('#block'+block+'chain'+chain+'nonce').val(MD5(valcomp));
      $('#block'+block+'chain'+chain+'hash').val(sha512(block, chain));
      if ($('#block'+block+'chain'+chain+'hash').val().substr(0, difficulty) === pattern) {
        if (isChain) {
          updateChain(block, chain);
        }
        else {
          updateState(block, chain);
        }
        break;
      }
    }

  }
  
}
