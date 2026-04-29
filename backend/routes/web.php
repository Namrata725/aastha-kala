use App\Http\Controllers\Api\ZktAdmsController;

Route::get('/', function () {
    return view('welcome');
});

// ZKTeco ADMS Cloud Routes (Outside /api for better device compatibility)
Route::get('/iclock/cdata', [ZktAdmsController::class, 'handshake']);
Route::post('/iclock/cdata', [ZktAdmsController::class, 'receiveData']);
Route::get('/iclock/getrequest', [ZktAdmsController::class, 'getRequest']);

