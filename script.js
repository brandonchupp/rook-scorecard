let round_number = 0;
let MAX_SCORE = 180;
let WINNING_SCORE = 500;
let NUMBER_OF_PLAYERS = 4;
let CALL_PARTNERS = true;

$(document).ready(function() {
	// Hide name label forms
	$('.player-label-form').hide();

	// Set the current dealer
	$('#current-dealer').text($('#p' + round_number % NUMBER_OF_PLAYERS + '-label').text());

	$('#settings-modal').modal('show');
	// Set bid
	addBid();
});

// Allow for settings change
$('#save-settings').click(function () {
	MAX_SCORE = $('#settings-winningscore').val();
	WINNING_SCORE = $('#settings-maxpoints').val();
	CALL_PARTNERS = $('#settings-callpartners').is(':checked');
});

// Change player labels
$('.player-label').click(function() {
    let label = this;
    let label_form = '#' + $(label).attr('id') + '-form';
    $(label).hide();
    $(label_form).val($(label).text()).show().select();

    function saveName() {
    	let name = $(label_form).val().trim();
    	if (name === '') {
    		$(label).text($(label).data('default')).show();
    	} else {
    		$(label).text(name).show();
    	}
    	$(label_form).hide();
    	// Refresh the current dealer
		$('#current-dealer').text($('#p' + round_number % NUMBER_OF_PLAYERS + '-label').text());
    	refreshBiddingPlayers();
    }

    // On 'Enter' change name
    $(label_form).keypress((e) => {
    	// 'Enter key is pressed'
	    if (e.which == 13) {
	    	saveName();
	    	return false;
	    }
	});

	$(label_form).focusout(() => {
		saveName();
	})
});

function createPlayersDropdown(target_class) {
	// Creates a set of options with the current players names under the target_class form
	let player_name_html = '';
	$('#score-table .player-label').each(function() {
		player_name_html += `<option data-playerid="${$(this).attr('id')}">${$(this).text()}</option>`
	});
	$(target_class).html(player_name_html);
}

function refreshBiddingPlayers() {
	createPlayersDropdown('.bidding-player');
	createPlayersDropdown('.partner-player');
}


function addBid() {
	$('.current-bid').removeClass('current-bid');
	$('#score-table > tbody tr:last-child').before(`
		<tr>
			<td>${round_number + 1}</td>
			<td class='p0-score'></td>
			<td class='p1-score'></td>
			<td class='p2-score'></td>
			<td class='p3-score'></td>
			<td><input class="form-control form-control-sm current-bid"></td>
			<td><select class="form-control form-control-sm bidding-player"></select></td>
			<td>
				<select class="form-control form-control-sm current-color">
					<option class="text-dark">Black</option>
					<option class="text-success">Green</option>
					<option class="text-danger">Red</option>
					<option class="text-warning">Yellow</option>
				</select>
			</td>
			<td><select class="form-control form-control-sm partner-player"></select></td>
			<td>
				<button class="btn btn-sm btn-primary score-button">Enter Score</button>
				<i class="fa fa-check-circle fa-2x text-success bid-success"></i>
				<i class="fa fa-times-circle fa-2x text-danger bid-failure"></i>
			</td>
		</tr>`);
	refreshBiddingPlayers();
	$('.bid-success').hide();
	$('.bid-failure').hide();
	$('.score-button').hide();

function computeScores(bid) {
	let bidder_id = $('.bidding-player option:selected').data('playerid');
	let partner_id = $('.partner-player option:selected').data('playerid');
	let other_players = [];
	$('#score-table .player-label').each(function() {
		let id = $(this).attr('id');
		if (id != bidder_id && id != partner_id){
			other_players.push(id);
		}
	});

	// Lock dropdowns
	$('.bidding-player').parent().html($('.bidding-player').val());
	$('.partner-player').parent().html($('.partner-player').val());
	let selected_color = $('.current-color option:selected');
	$('.current-color').parent().html(
		`<div class=${selected_color.attr('class')}>${selected_color.val()}</div>`
	);

	// Get the opposing team's score since it should be less than the bidding team
	let opposing_score;
	do {
		opposing_score = prompt('What did the opposing team score?');
	} while (!$.isNumeric(opposing_score)
		|| !(parseInt(opposing_score) >= 0 && parseInt(opposing_score) <= MAX_SCORE))
	opposing_score = parseInt(opposing_score);



	if (MAX_SCORE - opposing_score >= bid) {
		// Set the score for the bidder
		$('.' + bidder_id.replace('-label', '-score')).last().text(MAX_SCORE - opposing_score);
		// Set the score for the partner
		$('.' + partner_id.replace('-label', '-score')).last().text(MAX_SCORE - opposing_score);
		other_players.forEach(function(player) {
			$('.' + player.replace('-label', '-score')).last().text(opposing_score);
		});
		$('.bid-failure').removeClass('bid-failure');
		$('.bid-success').show().removeClass('bid-success');
		$('.score-button').hide().removeClass('score-button');
	} else {
		// Set the score for the bidder
		$('.' + bidder_id.replace('-label', '-score')).last().text('-' + bid);
		// Set the score for the partner
		$('.' + partner_id.replace('-label', '-score')).last().text('-' + bid);
		other_players.forEach(function(player) {
			$('.' + player.replace('-label', '-score')).last().text(opposing_score);
		});
		$('.bid-success').hide().removeClass('bid-success');
		$('.bid-failure').show().removeClass('bid-failure');
		$('.score-button').hide().removeClass('score-button');
	}

	//Calculate all scores
	$('#score-table .player-label').each(function() {
		let score = 0
		let current_id = $(this).attr('id').replace('-label', '-score');
		$('.' + current_id).each(function() {
			score += parseInt($(this).text() || 0);
		});
		$('.' + current_id + '-total').text(score);
	});

}

	function advanceRound(){
		// Increase the round counter and highlight the next dealer
		$('#p' + round_number % NUMBER_OF_PLAYERS + '-label').removeClass('table-info');
		round_number += 1;
		$('#p' + round_number % NUMBER_OF_PLAYERS + '-label').addClass('table-info');
		$('#current-dealer').text($('#p' + round_number % NUMBER_OF_PLAYERS + '-label').text());

	}

	function saveBid() {
		let bid = $('.current-bid').val().trim();
		if ($.isNumeric(bid) && parseInt(bid) >= 0 && parseInt(bid) <= MAX_SCORE) {
			$('.score-button').show();
			$('.current-bid').parent().html(bid);
			$('.current-bid').removeClass('current-bid');

			// Handle the completion of a round
			$('.score-button').click(function() {
				computeScores(bid);
				advanceRound();
				addBid();
			});
		}
	}
	$('.current-bid').focus().focusout(() => { saveBid(); });


}