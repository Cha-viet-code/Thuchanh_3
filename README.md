# StudyManager – Thực hành 4 (API & Offline)

Ứng dụng Quản lý học tập bằng **React Native CLI + TypeScript**, lấy dữ liệu từ REST API (json-server), dùng được khi offline và tự đồng bộ khi có mạng trở lại.

## 1. Cài đặt

Trong project React Native CLI đã tạo (mã nguồn ở `App.tsx` và `src/`):

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage @react-native-community/netinfo
# iOS
cd ios && pod install && cd ..
```

Lưu ý:

- React Navigation v6 hoặc v7 đều dùng được (code chỉ dùng API chung).
- Nếu `index.js` đang import `App` thì giữ nguyên, `App.tsx` đã export default.
- iOS: gọi HTTP tới IP LAN cần thêm ngoại lệ App Transport Security trong `Info.plist` (`NSAllowsArbitraryLoads` hoặc `NSAllowsLocalNetworking`). Android bản debug cho phép HTTP sẵn.

## 2. Chạy server giả lập

```bash
npm install -g json-server@0.17.4
json-server --watch db.json --host 0.0.0.0 --port 3000 --delay 800
```

Đổi địa chỉ server trong `src/config.ts`:

- Máy ảo Android: để trống `LAN_IP` (tự dùng `http://10.0.2.2:3000`).
- iOS Simulator: để trống (dùng `localhost`).
- Điện thoại thật: điền `LAN_IP = '192.168.x.x'` (IP máy tính, cùng Wi-Fi).

## 3. Chạy ứng dụng

```bash
npx react-native start
npx react-native run-android   # hoặc run-ios
```

## 4. Sơ đồ luồng dữ liệu

````
Màn hình ──► Hook / Context ──► Service ──► client.request ──► API (json-server)
 (screens)   useCachedQuery      (api/*)                           ▲
             useAppData                                            │
                 │   ghi cache sau GET thành công                  │
                 ├──────────► Cache (AsyncStorage "cache:<key>")   │
                 │                                                 │
                 │   offline: thao tác ghi                         │
                 └──────────► Outbox (AsyncStorage "outbo# StudyManager – Thực hành 4 (API & Offline)

Ứng dụng Quản lý học tập bằng **React Native CLI + TypeScript**, lấy dữ liệu từ REST API (json-server), dùng được khi offline và tự đồng bộ khi có mạng trở lại.

## 1. Cài đặt

Trong project React Native CLI đã tạo (mã nguồn ở `App.tsx` và `src/`):

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage @react-native-community/netinfo
# iOS
cd ios && pod install && cd ..
````

Lưu ý:

- React Navigation v6 hoặc v7 đều dùng được (code chỉ dùng API chung).
- Nếu `index.js` đang import `App` thì giữ nguyên, `App.tsx` đã export default.
- iOS: gọi HTTP tới IP LAN cần thêm ngoại lệ App Transport Security trong `Info.plist` (`NSAllowsArbitraryLoads` hoặc `NSAllowsLocalNetworking`). Android bản debug cho phép HTTP sẵn.

## 2. Chạy server giả lập

```bash
npm install -g json-server@0.17.4
json-server --watch db.json --host 0.0.0.0 --port 3000 --delay 800
```

Đổi địa chỉ server trong `src/config.ts`:

- Máy ảo Android: để trống `LAN_IP` (tự dùng `http://10.0.2.2:3000`).
- iOS Simulator: để trống (dùng `localhost`).
- Điện thoại thật: điền `LAN_IP = '192.168.x.x'` (IP máy tính, cùng Wi-Fi).

## 3. Chạy ứng dụng

```bash
npx react-native start
npx react-native run-android   # hoặc run-ios
```

## 4. Sơ đồ luồng dữ liệu

```
Màn hình ──► Hook / Context ──► Service ──► client.request ──► API (json-server)
 (screens)   useCachedQuery      (api/*)                           ▲
             useAppData                                            │
                 │   ghi cache sau GET thành công                  │
                 ├──────────► Cache (AsyncStorage "cache:<key>")   │
                 │                                                 │
                 │   offline: thao tác ghi                         │
                 └──────────► Outbox (AsyncStorage "outbox") ──────┘
                               useOutboxSync gửi lần lượt khi có mạng
```

- **Đọc (GET)**: `useCachedQuery` hiện ngay dữ liệu trong cache, rồi gọi API nếu có mạng; thành công thì cập nhật state và cache (`{ data, savedAt }`).
- **Ghi (PATCH/POST)**:
  - Online: gọi API; đổi trạng thái bài tập dùng _optimistic update_, lỗi thì hoàn tác và báo người dùng.
  - Offline: thao tác được `enqueue` vào hàng đợi `{ id, method, url, body, createdAt }`; giao diện hiển thị ngay (cache + hàng đợi) và mục đó có nhãn **"Chưa đồng bộ"**.
- **Đồng bộ**: `useOutboxSync` tự chạy khi `isOnline` chuyển sang `true` (và thử lại mỗi 20 giây nếu còn thao tác chờ), gửi **tuần tự theo thứ tự thêm vào**; thành công thì `remove` khỏi hàng đợi, lỗi mạng thì dừng và giữ lại để thử sau. Xong thì hiện thông báo "Đã đồng bộ N thay đổi" và tải lại dữ liệu.
- Bài tập tạo offline có id tạm `local-…`; khi POST thành công, id thật được thay vào các thao tác sau đó trong hàng đợi.

## 5. Xử lý xung đột (B5)

Mỗi bản ghi có `updatedAt`. Thao tác offline lưu `createdAt` (thời điểm người dùng thao tác). Khi đồng bộ một thao tác `PATCH`:

1. Gọi `GET` bản ghi hiện tại trên server.
2. Nếu `server.updatedAt` **mới hơn** `createdAt` của thao tác ⇒ có người đã sửa bản ghi sau lần offline của người dùng ⇒ **ưu tiên dữ liệu server**: bỏ thao tác offline khỏi hàng đợi và báo cho người dùng ("… bị bỏ qua vì dữ liệu trên máy chủ mới hơn").
3. Ngược lại ⇒ gửi `PATCH` kèm `updatedAt = createdAt`.
4. Nếu bản ghi không còn trên server (404) cũng ưu tiên server và bỏ thao tác.

Cách này đơn giản, không ghi đè nhầm thay đổi mới hơn (kiểu _last-write-wins_ dựa trên thời gian, nhưng thắng thuộc về server khi mới hơn). Thao tác `POST` không có xung đột vì là bản ghi mới.

## 6. Cấu trúc thư mục

Đúng theo mục 5 của đề (đuôi `.ts`/`.tsx`):
`api/` (client + service) → `storage/` (cache, outbox) → `hooks/`, `context/` → `screens/` → `components/` (trình bày), cùng `navigation/`, `theme/`, `utils/`.
Các file bổ sung ngoài đề: `types/index.ts`, `hooks/useDataQueries.ts`, `navigation/stackOptions.ts`, `utils/{errors,id,text,outboxOverlay}.ts`.

## 7. Kịch bản kiểm thử

| #   | Cách thử                                                            | Kết quả                                               |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Tắt json-server, mở app lần đầu                                     | Màn hình lỗi + nút "Thử lại"                          |
| 2   | Có mạng → bật chế độ máy bay → khởi động lại app                    | Dữ liệu từ cache, banner offline, "Cập nhật lần cuối" |
| 3   | Offline: đánh dấu 2 bài xong, thêm 1 bài                            | UI đổi ngay, nhãn "Chưa đồng bộ"                      |
| 4   | Tắt chế độ máy bay                                                  | Tự đồng bộ, nhãn mất, `db.json` đổi đúng              |
| 5   | Offline sửa họ tên; sửa `db.json` với `updatedAt` mới hơn; bật mạng | Giữ dữ liệu server, có thông báo                      |
| 6   | Tìm môn không tồn tại / lọc học kỳ rỗng                             | Trạng thái rỗng thân thiện                            |
| 7   | Kéo để làm mới                                                      | Dữ liệu tải lại                                       |

x") ──────┘
useOutboxSync gửi lần lượt khi có mạng

```

- **Đọc (GET)**: `useCachedQuery` hiện ngay dữ liệu trong cache, rồi gọi API nếu có mạng; thành công thì cập nhật state và cache (`{ data, savedAt }`).
- **Ghi (PATCH/POST)**:
  - Online: gọi API; đổi trạng thái bài tập dùng *optimistic update*, lỗi thì hoàn tác và báo người dùng.
  - Offline: thao tác được `enqueue` vào hàng đợi `{ id, method, url, body, createdAt }`; giao diện hiển thị ngay (cache + hàng đợi) và mục đó có nhãn **"Chưa đồng bộ"**.
- **Đồng bộ**: `useOutboxSync` tự chạy khi `isOnline` chuyển sang `true` (và thử lại mỗi 20 giây nếu còn thao tác chờ), gửi **tuần tự theo thứ tự thêm vào**; thành công thì `remove` khỏi hàng đợi, lỗi mạng thì dừng và giữ lại để thử sau. Xong thì hiện thông báo "Đã đồng bộ N thay đổi" và tải lại dữ liệu.
- Bài tập tạo offline có id tạm `local-…`; khi POST thành công, id thật được thay vào các thao tác sau đó trong hàng đợi.

## 5. Xử lý xung đột (B5)

Mỗi bản ghi có `updatedAt`. Thao tác offline lưu `createdAt` (thời điểm người dùng thao tác). Khi đồng bộ một thao tác `PATCH`:

1. Gọi `GET` bản ghi hiện tại trên server.
2. Nếu `server.updatedAt` **mới hơn** `createdAt` của thao tác ⇒ có người đã sửa bản ghi sau lần offline của người dùng ⇒ **ưu tiên dữ liệu server**: bỏ thao tác offline khỏi hàng đợi và báo cho người dùng ("… bị bỏ qua vì dữ liệu trên máy chủ mới hơn").
3. Ngược lại ⇒ gửi `PATCH` kèm `updatedAt = createdAt`.
4. Nếu bản ghi không còn trên server (404) cũng ưu tiên server và bỏ thao tác.

Cách này đơn giản, không ghi đè nhầm thay đổi mới hơn (kiểu *last-write-wins* dựa trên thời gian, nhưng thắng thuộc về server khi mới hơn). Thao tác `POST` không có xung đột vì là bản ghi mới.

## 6. Cấu trúc thư mục

Đúng theo mục 5 của đề (đuôi `.ts`/`.tsx`):
`api/` (client + service) → `storage/` (cache, outbox) → `hooks/`, `context/` → `screens/` → `components/` (trình bày), cùng `navigation/`, `theme/`, `utils/`.
Các file bổ sung ngoài đề: `types/index.ts`, `hooks/useDataQueries.ts`, `navigation/stackOptions.ts`, `utils/{errors,id,text,outboxOverlay}.ts`.

## 7. Kịch bản kiểm thử

| # | Cách thử | Kết quả |
|---|----------|---------|
| 1 | Tắt json-server, mở app lần đầu | Màn hình lỗi + nút "Thử lại" |
| 2 | Có mạng → bật chế độ máy bay → khởi động lại app | Dữ liệu từ cache, banner offline, "Cập nhật lần cuối" |
| 3 | Offline: đánh dấu 2 bài xong, thêm 1 bài | UI đổi ngay, nhãn "Chưa đồng bộ" |
| 4 | Tắt chế độ máy bay | Tự đồng bộ, nhãn mất, `db.json` đổi đúng |
| 5 | Offline sửa họ tên; sửa `db.json` với `updatedAt` mới hơn; bật mạng | Giữ dữ liệu server, có thông báo |
| 6 | Tìm môn không tồn tại / lọc học kỳ rỗng | Trạng thái rỗng thân thiện |
| 7 | Kéo để làm mới | Dữ liệu tải lại |
```
