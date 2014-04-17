SUNWAIT = sunwait
SHC = shc

.PHONY: build

build:
	$(MAKE) -C $(SUNWAIT)
	$(MAKE) -C $(SHC)
	$(MAKE) -C $(MERCURY236)
	cp $(SUNWAIT)/sunwait $(SHC)/bin
	cp $(MERCURY236)/mercury236 $(SHC)/bin

clean:
	$(MAKE) -C $(SUNWAIT) clean
	$(MAKE) -C $(SHC) clean
