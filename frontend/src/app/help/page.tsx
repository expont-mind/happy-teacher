const helpData = [
  {
    id: 1,
    title: "Happy Teacher танилцуулга",
    description: "Вэб сайтын үндсэн функц, боломжуудтай танилцах",
    video: "",
  },
  {
    id: 2,
    title: "Сурагчийн амжилт логик",
    description: "Сурагчид хэрхэн амжилттай суралцах талаар мэдээлэл",
    video: "",
  },
  {
    id: 3,
    title: "Интерактив сургалт",
    description: "Сургалтыг хэрхэн илүү интерактив болгох талаар",
    video: "",
  },
  {
    id: 4,
    title: "Олон нийтийн оролцоо",
    description: "Сургалтын орчинд олон нийтийн оролцоог хэрхэн нэмэгдүүлэх",
    video: "",
  },
];

export default function Help() {
  return (
    <div className="w-full h-[calc(100vh-77px)] flex justify-center bg-white">
      <div className="max-w-[1280px] w-full flex flex-col items-center gap-14 py-14">
        <div className="flex flex-col gap-5 items-center max-w-[366px]">
          <div className="w-[60px] h-[60px]  rounded-full bg-[#D9D9D9]"></div>
          <p className="text-black font-semibold text-[24px] font-nunito">
            Тусламж & Заавар
          </p>
          <p className="text-[#858480] font-extrabold text-xs font-nunito text-center">
            Happy Teacher хэрхэн ашиглах талаар дэлгэрэнгүй заавар бичлэгүүд. 16
            бичлэгээс өөрт хэрэгтэй мэдээллээ олоорой!
          </p>
        </div>
        <div className="grid grid-cols-4 gap-20 w-full">
          {helpData.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1.5 w-full border border-[#0C0A0126] rounded-[10px] pb-4 overflow-hidden"
            >
              <div className="w-full h-[140px] bg-[#F2F2F2]"></div>

              <div className="flex flex-col gap-1.5 px-[10px] py-1">
                <p className="text-black font-semibold text-sm font-nunito">
                  {item.title}
                </p>
                <p className="text-black font-semibold text-xs font-nunito">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
