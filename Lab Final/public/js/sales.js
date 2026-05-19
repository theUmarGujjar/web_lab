// Poll /sales/api every 10 seconds and update the dashboard
function renderStats(data) {
  if (!data || !data.stats) return;
  const stats = data.stats;

  // Total revenue & orders using jQuery
  $('#totalRevenue').text(`$${Number(stats.totalRevenue).toFixed(2)}`);
  $('#totalOrders').text(stats.totalOrders);

  // Revenue by category using jQuery
  const $catEl = $('#revenueByCategory');
  if ($catEl.length) {
    $catEl.empty();
    $.each(stats.revenueByCategory || [], function (i, c) {
      const $li = $('<li>').html(`<strong>${c.category}</strong>: $${Number(c.revenue).toFixed(2)}`);
      $catEl.append($li);
    });
  }

  // Top products using jQuery
  const $tp = $('#topProducts');
  if ($tp.length) {
    const $tbody = $tp.find('tbody');
    $tbody.empty();
    $.each(stats.topProducts || [], function (i, p) {
      const $tr = $('<tr>').html(`<td>${p.name}</td><td>${p.qty}</td><td>$${Number(p.revenue).toFixed(2)}</td>`);
      $tbody.append($tr);
    });
  }

  // Recent sales using jQuery
  const $recentEl = $('#recentSales');
  if ($recentEl.length && data.recent) {
    $recentEl.empty();
    $.each(data.recent, function (i, s) {
      const $li = $('<li>');
      const when = new Date(s.createdAt).toLocaleString();
      $li.html(`<strong>${s.name}</strong> — ${s.quantity} × $${Number(s.price).toFixed(2)} — $${Number(s.total).toFixed(2)} — <small>${when}</small>`);
      $recentEl.append($li);
    });
  }
}

function fetchAndUpdate() {
  $.ajax({
    url: '/sales/api',
    method: 'GET',
    dataType: 'json',
    success: function (res) {
      if (res && res.ok) {
        renderStats(res);
      }
    }
  });
}

$(function () {
  // Initial fetch already provided by server-side render, but refresh on load
  fetchAndUpdate();
  setInterval(fetchAndUpdate, 10000); // 10 seconds interval as requested
});
