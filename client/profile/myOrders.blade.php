<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pharmart</title>
    <link rel="stylesheet" href="{{ asset('assets/css/profile.css') }}">
</head>

<body>
@include('/templates/header')
<div class="container-wrapper">
    <div class="container">
        <div class="wrapper-content">
            @include('/profile/_profileSidebarLeft')

            <!-- Content -->
            <div class="my-order-content-area">
                <div class="header-table">
                    <div class="header-table-item order-code">Mã đơn hàng</div>
                    <div class="header-table-item order-created-at">Ngày đặt mua</div>
                    <div class="header-table-item order-prices">Tổng tiền</div>
                    <div class="header-table-item order-status">Trạng thái đơn hàng</div>
                </div>
                <table class="table">
                    <tbody>
                        @for($i = 0; $i < 10; $i++)
                            <tr>
                                <th scope="row" class="order-code-td">957378455</th>
                                <td class="order-created-at">08:50 30/03/2021</td>
                                <td class="order-prices-td">1.000.00 VND</td>
                                <td class="order-status">
                                    @if($i%3 == 0)
                                    <span class="delivering">ĐANG VẬN CHUYỂN</span>
                                    @endif
                                    @if($i%3 == 1)
                                    <span class="delivery-success">GIAO HÀNG THÀNH CÔNG</span>
                                    @endif
                                    @if($i%3 == 2)
                                    <span class="delivery-cancel">ĐÃ HỦY</span>
                                    @endif
                                </td>
                            </tr>
                        @endfor
                    </tbody>
                </table>
                <!--Pagination-->
                <div class="--header-bottom pagination">
                    <div class="pagination-prev">
                        <i class="fa fa-chevron-left" aria-hidden="true"></i>
                    </div>
                    @for($i = 1; $i < 3; $i++)
                    <div class="pagination-number">
                        {{ $i }}
                    </div>
                    @endfor
                    <div class="pagination-number active">4</div>
                    <span>...</span>
                    <div class="pagination-number">15</div>
                    <div class="pagination-next">
                        <i class="fa fa-chevron-right" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@include('/templates/footer')
</body>

</html>
<script src="{{ asset('assets/js/profile.js') }}"></script>
<script>
    $(document).ready(function(){

    });
</script>
